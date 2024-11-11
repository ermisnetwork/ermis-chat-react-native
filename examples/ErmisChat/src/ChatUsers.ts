import { UserResponse } from 'ermis-chat-sdk';
import { ErmisChatGenerics } from './types';

export const USER_TOKENS: Record<string, string> = {
  khoakheu:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMHhjMDE5MTg5YmE3MjIyZmZlMGUyM2QzYjY0NzRkMTA0MjY2ZjBmZmIyIiwiZXhwIjoxNzE5NDg2MzQzNTkwfQ._vrK-E2cT49YOeGH1Z0GwAvS1XzBkotHV_p9ClC1mQ8',
};
export const USERS: Record<string, UserResponse<ErmisChatGenerics>> = {
  khoakheu: {
    id: '0xc019189ba7222ffe0e23d3b6474d104266f0ffb2',
    image: 'https://randomuser.me/api/portraits/thumb/women/12.jpg',
    name: '0xc019189ba7222ffe0e23d3b6474d104266f0ffb2',
  },
};
