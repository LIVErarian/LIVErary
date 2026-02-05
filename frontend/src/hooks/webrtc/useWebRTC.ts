import { useCallback, useEffect, useRef, useState } from 'react';
import type { Client } from '@stomp/stompjs';

import { getHeaders, useSocketStore } from '@/store/useSocketStore';

import type { SignalingMessage } from '@/types/socket.types';

export const useWebRTC = (roomId: string, myUserId: string) => {
  const { client, isConnected } = useSocketStore();

  // 다른 사람들의 목소리 데이터 모음
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );

  const publisherPC = useRef<RTCPeerConnection | null>(null); // 내가 말하는 통로
  const subscriberPCs = useRef<Map<string, RTCPeerConnection>>(new Map()); // 남의 소리를 듣는 통로
  const localStream = useRef<MediaStream | null>(null); // 내 목소리
  const joinReady = useRef(false);
  const isCleaningUp = useRef(false);

  // pagehide/언마운트에서도 마이크/PC를 확실히 정리한다.
  const cleanupResources = useCallback(() => {
    if (isCleaningUp.current) return;
    isCleaningUp.current = true;

    joinReady.current = false;

    if (publisherPC.current) {
      publisherPC.current.close();
      publisherPC.current = null;
    }

    subscriberPCs.current.forEach((pc) => {
      if (pc) pc.close();
    });
    subscriberPCs.current.clear();

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    setRemoteStreams(new Map());

    isCleaningUp.current = false;
  }, [setRemoteStreams]);

  // 마이크 초기화 (useCallback을 이용해서 함수 저장)
  const initLocalStream = useCallback(async () => {
    try {
      if (localStream.current) return localStream.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true, // 에코 제거
          noiseSuppression: true, // 배경 노이즈 제거
          autoGainControl: true, // 마이크 소리 자동 조절
        },
        video: false,
      });

      // 마이크 상태를 시작하자마자 disabled로 변경
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });

      localStream.current = stream;
      return stream;
    } catch (error) {
      console.error('마이크 권한 실패', error);
      return null;
    }
  }, []);

  // 마이크 토글
  const toggleMic = useCallback((enabled: boolean) => {
    if (localStream.current) {
      localStream.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = enabled));
    }
  }, []);

  // 공통 설정 및 생성 함수 분리
  const createPeerConnection = () => {
    return new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: import.meta.env.VITE_STUN_SERVER },
        {
          urls: [
            import.meta.env.VITE_TURN_SERVER_UDP,
            import.meta.env.VITE_TURN_SERVER_TCP,
          ],
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_PASSWORD,
        },
      ],
    });
  };

  // ICE Candidate 설정 함수 (서로의 위치 찾기)
  const setupIceCandidate = (
    pc: RTCPeerConnection,
    userId: string, // 대상 유저 ID
    client: Client | null,
    headers: Record<string, string>,
  ) => {
    pc.onicecandidate = (event) => {
      if (event.candidate && client?.connected) {
        // 찾아낸 주소를 상대방(서버)에게 전달
        client.publish({
          destination: '/app/onIceCandidate',
          body: JSON.stringify({
            userId: userId,
            candidate: event.candidate,
          }),
          headers,
        });
      }
    };
  };

  // Publisher 생성 (내 목소리 송출)
  const createPublisher = useCallback(async () => {
    if (!localStream.current || !myUserId || !client) return;
    if (publisherPC.current) return;

    console.log('[Publisher] 송출 시작');

    const pc = createPeerConnection();

    localStream.current.getTracks().forEach((track) => {
      // 생성된 pc에 내 마이크 데이터 넣기
      pc.addTrack(track, localStream.current!);
      // 송신 전용
      pc.getTransceivers().forEach((t) => (t.direction = 'sendonly'));
    });

    // 서로의 위치 찾기 (ICE Candidate)
    setupIceCandidate(pc, myUserId, client, getHeaders());

    publisherPC.current = pc;

    // SDP 형식의 제안서 생성
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Offer 전송
    client.publish({
      destination: '/app/receiveDataFrom',
      body: JSON.stringify({ senderId: myUserId, sdpOffer: offer.sdp }),
      headers: getHeaders(),
    });
  }, [client, myUserId]);

  // Subscriber 생성
  const createSubscriber = useCallback(
    async (targetUserId: string) => {
      if (!client) return;
      if (subscriberPCs.current.has(targetUserId)) return;

      const pc = createPeerConnection();

      // 수신 전용 통로 (receive only)
      pc.addTransceiver('audio', { direction: 'recvonly' });

      // 들어온 스트림을 map에 저장하여 audio 태그 생성
      pc.ontrack = (event) => {
        const stream = event.streams[0];
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.set(targetUserId, stream);
          return newMap;
        });
      };

      setupIceCandidate(pc, targetUserId, client, getHeaders());

      // 연결 상태 감시 (끊기면 제거)
      pc.onconnectionstatechange = () => {
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.delete(targetUserId);
            return newMap;
          });
        }
      };

      subscriberPCs.current.set(targetUserId, pc);

      // 서버에 연결 통로 요청
      const offer = await pc.createOffer({
        offerToReceiveAudio: true, // 오디오 수신
        offerToReceiveVideo: false, // 비디오는 x
      });
      await pc.setLocalDescription(offer);

      // 누구의 목소리를 들을 건지 서버에 전달 (내 목소리 아님 주의!!)
      client.publish({
        destination: '/app/receiveDataFrom',
        body: JSON.stringify({ senderId: targetUserId, sdpOffer: offer.sdp }),
        headers: getHeaders(),
      });
    },
    [client],
  );

  useEffect(() => {
    if (!client || !isConnected || !roomId || !myUserId) return;

    // Ref 값 복사
    // const currentSubscriberPCs = subscriberPCs.current; // unused variable removed

    // 안전장치
    let isMounted = true;
    joinReady.current = false;

    const start = async () => {
      // 마이크 준비
      await initLocalStream();
      if (!isMounted) return;

      // 구독 먼저 실행
      const sub = client.subscribe(
        '/user/queue/signaling',
        async (msg) => {
          const payload: SignalingMessage = JSON.parse(msg.body);

          // payload id 기준으로 case 나누기
          switch (payload.id) {
            // 기존 참가자 목록 받기
            case 'existingParticipants':
              payload.data.forEach((id) => {
                // 나를 제외한 나머지 구독
                if (id !== myUserId) createSubscriber(id);
              });
              // 방 입장 완료 flag
              joinReady.current = true;
              break;

            // 새로운 사용자 목소리 듣기
            case 'newParticipantArrived':
              // 새로 온 사람의 아이디로 수신용 통로 뚫기
              if (payload.userId !== myUserId) createSubscriber(payload.userId);
              break;

            // Offer에 대한 서버의 Answer; setRemoteDescription에 이걸 넣어야 연결 확정
            case 'receiveDataAnswer':
              // 내 마이크 송출에 대한 응답
              if (payload.senderId === myUserId) {
                const pc = publisherPC.current;

                // 내가 제안서를 보낸 상태일 때만 실행
                if (pc && pc.signalingState === 'have-local-offer') {
                  // 서버의 응답을 내 PC에 등록
                  await pc.setRemoteDescription(
                    new RTCSessionDescription({
                      type: 'answer',
                      sdp: payload.sdpAnswer,
                    }),
                  );
                }
              }
              // 남의 소리 수신에 대한 응답
              else {
                // 누구의 소리에 대한 응답인지 찾기
                const pc = subscriberPCs.current.get(payload.senderId);

                if (pc && pc.signalingState === 'have-local-offer') {
                  // 서버의 응답 등록
                  await pc.setRemoteDescription(
                    new RTCSessionDescription({
                      type: 'answer',
                      sdp: payload.sdpAnswer,
                    }),
                  );
                }
              }
              break;

            // 경로 정보 교환
            case 'iceCandidate':
              if (payload.userId === myUserId)
                // Publisher에 주소 후보 등록
                await publisherPC.current?.addIceCandidate(
                  new RTCIceCandidate(payload.candidate),
                );
              else
                // Subscriber에 주소 후보 등록
                await subscriberPCs.current
                  .get(payload.userId)
                  ?.addIceCandidate(new RTCIceCandidate(payload.candidate));
              break;

            // 참가자 퇴장
            case 'participantLeft':
              // webRTC 연결 해제
              subscriberPCs.current.get(payload.userId)?.close();
              // 관리 목록(map)에서 제거
              subscriberPCs.current.delete(payload.userId);
              // 화면 갱신
              setRemoteStreams((prev) => {
                const newMap = new Map(prev);
                newMap.delete(payload.userId);
                return newMap;
              });
              break;
          }
        },
        getHeaders(),
      );

      // 방 입장 요청
      client.publish({
        destination: '/app/joinRoom',
        body: JSON.stringify({ roomId }),
        headers: getHeaders(),
      });
      console.log('방 입장 요청 전송 (Session Open)');

      // join 완료 이후 송출 시작
      // existingParticipants 수신 후에만 receiveDataFrom 전송 (순서 꼬이면 오류남!!)
      const waitForJoinReady = async () => {
        while (!joinReady.current) {
          // 천천히 입장시키기
          await new Promise((resolve) => setTimeout(resolve, 50));
          if (!isMounted) return false;
        }
        return true;
      };
      if (await waitForJoinReady()) {
        await createPublisher();
      }

      return sub;
    };

    const setupPromise = start();

    return () => {
      isMounted = false;

      setupPromise
        .then((sub) => sub?.unsubscribe())
        .catch((error) => {
          console.warn('시그널링 구독 해제 중 경고:', error);
        });

      cleanupResources();
    };
  }, [
    client,
    isConnected,
    roomId,
    myUserId,
    initLocalStream,
    createPublisher,
    createSubscriber,
    cleanupResources,
  ]);

  useEffect(() => {
    const handlePageHide = () => cleanupResources();
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
      cleanupResources();
    };
  }, [cleanupResources]);

  return { initLocalStream, toggleMic, remoteStreams };
};
