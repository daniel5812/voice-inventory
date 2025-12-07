export interface Movement {
  id: number;
  type: "add" | "remove" | "set" | "create";
  quantity: number;
  rawText: string;
  createdAt: string;
  item: {
    id: number;
    name: string;
  };
}
