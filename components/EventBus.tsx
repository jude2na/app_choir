import React, { createContext, useContext, useRef, ReactNode } from "react";

type Handler = (payload?: any) => void;

type EventBus = {
	emit: (event: string, payload?: any) => void;
	on: (event: string, handler: Handler) => () => void;
};

const EventBusContext = createContext<EventBus | null>(null);

export const EventBusProvider = ({ children }: { children: ReactNode }) => {
	// listeners map: event -> Set of handlers
	const listenersRef = useRef<Map<string, Set<Handler>>>(new Map());

	const emit = (event: string, payload?: any) => {
		const set = listenersRef.current.get(event);
		if (!set) return;
		// call handlers copy to avoid mutation issues
		Array.from(set).forEach((h) => {
			try {
				h(payload);
			} catch (e) {
				// swallow handler errors so one bad listener doesn't break others
				// eslint-disable-next-line no-console
				console.error("EventBus handler error", e);
			}
		});
	};

	const on = (event: string, handler: Handler) => {
		let set = listenersRef.current.get(event);
		if (!set) {
			set = new Set();
			listenersRef.current.set(event, set);
		}
		set.add(handler);
		return () => {
			set!.delete(handler);
			if (set!.size === 0) listenersRef.current.delete(event);
		};
	};

	const value: EventBus = { emit, on };

	return (
		<EventBusContext.Provider value={value}>
			{children}
		</EventBusContext.Provider>
	);
};

export const useEventBus = (): EventBus => {
	const ctx = useContext(EventBusContext);
	if (!ctx) {
		// Provide a no-op fallback to avoid checking for null at call sites
		return {
			emit: () => {},
			on: () => () => {},
		};
	}
	return ctx;
};
