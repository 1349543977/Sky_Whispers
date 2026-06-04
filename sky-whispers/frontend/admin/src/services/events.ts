// ============================================================
// Sky Whispers Admin - Events Service
// ============================================================

import { apiClient } from "./api";
import type { GameEvent, EventFilterParams, PaginatedResponse } from "@/types";
import { buildQueryString } from "@/lib/utils";

export interface CreateEventPayload {
  name: string;
  description: string;
  type: GameEvent["type"];
  startDate: string;
  endDate: string;
  config: GameEvent["config"];
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  status?: GameEvent["status"];
}

export const eventsService = {
  async getEvents(params: EventFilterParams): Promise<PaginatedResponse<GameEvent>> {
    const qs = buildQueryString(params as unknown as Record<string, unknown>);
    const response = await apiClient.get<PaginatedResponse<GameEvent>>(`/events${qs}`);
    return response.data;
  },

  async getEventById(id: string): Promise<GameEvent> {
    const response = await apiClient.get<GameEvent>(`/events/${id}`);
    return response.data;
  },

  async createEvent(data: CreateEventPayload): Promise<GameEvent> {
    const response = await apiClient.post<GameEvent>("/events", data);
    return response.data;
  },

  async updateEvent(id: string, data: UpdateEventPayload): Promise<GameEvent> {
    const response = await apiClient.put<GameEvent>(`/events/${id}`, data);
    return response.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  async cancelEvent(id: string): Promise<GameEvent> {
    const response = await apiClient.patch<GameEvent>(`/events/${id}/cancel`);
    return response.data;
  },

  async getActiveEvents(): Promise<GameEvent[]> {
    const response = await apiClient.get<GameEvent[]>("/events/active");
    return response.data;
  },
};
