import { style } from '@vanilla-extract/css';

export const container = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
});

export const searchContainer = style({
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
});

export const searchInput = style({
    flex: 1,
});

export const searchButton = style({
    minWidth: '60px',
});

export const resultContainer = style({
    padding: '12px',
    border: `2px dashed #8B4513`,
    borderRadius: '4px',
    backgroundColor: '#f8f4eec0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
});

export const nickname = style({
    fontWeight: 'bold',
    fontSize: '1.1rem',
});

export const email = style({
    fontSize: '0.9rem',
    color: '#666',
});

export const actionContainer = style({
    marginTop: '8px',
});

export const statusMessage = style({
    fontWeight: 'bold',
});

export const statusFriend = style([statusMessage, {
    color: 'green',
}]);

export const statusPending = style([statusMessage, {
    color: '#d97706',
}]);

export const statusSelf = style([statusMessage, {
    color: '#8B4513',
}]);

export const statusBlocked = style([statusMessage, {
    color: 'red',
}]);
