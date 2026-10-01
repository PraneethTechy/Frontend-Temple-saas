import { baseApi } from './baseApi.js';
import type {
  ApiResponse,
  IConversation,
  IMessage,
  ConversationWithTemple,
  SendMessagePayload,
  UnreadCountResponse,
} from '@shared/types/index.js';

export interface ConversationsListResult {
  conversations: ConversationWithTemple[];
  totalUnread: number;
}

export interface ConversationHistoryResult {
  conversation: ConversationWithTemple;
  messages: IMessage[];
}

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Unread Count for floating button dot (polling friendly)
    getUnreadMessageCount: builder.query<ApiResponse<UnreadCountResponse>, void>({
      query: () => '/messages/unread-count',
      providesTags: ['Message'],
    }),

    // 2. Get Conversations List (Admin: all active temples; Authority: single conversation)
    getConversations: builder.query<ApiResponse<ConversationsListResult>, void>({
      query: () => '/messages/conversations',
      providesTags: ['Conversation'],
    }),

    // 3. Get My Conversation (for Temple Authority)
    getMyConversation: builder.query<ApiResponse<ConversationHistoryResult>, void>({
      query: () => '/messages/my-conversation',
      providesTags: ['Conversation', 'Message'],
    }),

    // 4. Get Conversation Messages History (Admin or Authority)
    getConversationMessages: builder.query<
      ApiResponse<ConversationHistoryResult>,
      string
    >({
      query: (conversationId) => `/messages/conversations/${conversationId}`,
      providesTags: (_result, _error, id) => [{ type: 'Message', id }],
    }),

    // 5. Send Message in Conversation
    sendMessage: builder.mutation<
      ApiResponse<{ message: IMessage; conversation: Partial<IConversation> }>,
      { conversationId: string; body: SendMessagePayload }
    >({
      query: ({ conversationId, body }) => ({
        url: `/messages/conversations/${conversationId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Message', 'Conversation'],
    }),

    // 6. Mark Conversation Read
    markConversationRead: builder.mutation<
      ApiResponse<{ success: boolean }>,
      string
    >({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Message', 'Conversation'],
    }),
  }),
});

export const {
  useGetUnreadMessageCountQuery,
  useGetConversationsQuery,
  useGetMyConversationQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} = messagesApi;

export default messagesApi;
