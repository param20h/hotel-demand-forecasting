
export interface DataExplorerRecord {
  occupied_date: string;
  hotel: string;
  room_category: string;
  occupied_room_nights: number;
}

export interface DataExplorerResponse {
  records: DataExplorerRecord[];

  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };

  summary: {
    total_demand: number;
    average_demand: number;
    record_count: number;
  };

  filters: {
    hotels: string[];
    room_categories: string[];
  };
}

export interface DataExplorerParams {
  hotel?: string;
  room_category?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  page_size?: number;
}
