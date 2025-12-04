export interface Movement {
    id: number;
    type: "add" | "remove";
    quantity: number;
    rawText: string;
    createdAt: string;
    item: {
      name: string;
    };
  }
  