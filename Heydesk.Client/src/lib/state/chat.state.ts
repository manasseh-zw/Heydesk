import { Store } from "@tanstack/store";

export type ChatState = {
  pendingInitialMessage: string | null;
  currentChatId: string | null;
};

const getInitialState = (): ChatState => ({
  pendingInitialMessage: null,
  currentChatId: null,
});

export const chatState = new Store<ChatState>(getInitialState());

export const chatActions = {
  setPendingInitialMessage: (message: string | null) => {
    chatState.setState((state) => ({
      ...state,
      pendingInitialMessage: message,
    }));
  },

  setCurrentChatId: (chatId: string | null) => {
    chatState.setState((state) => ({
      ...state,
      currentChatId: chatId,
    }));
  },

  consumePendingInitialMessage: (): string | null => {
    const message = chatState.state.pendingInitialMessage;
    chatState.setState((state) => ({
      ...state,
      pendingInitialMessage: null,
    }));
    return message;
  },

  clearChatState: () => {
    chatState.setState(getInitialState());
  },
};
