import { useEffect, useState, useImperativeHandle } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Flex,
} from "@chakra-ui/react";
import { getItems, addItem, removeItem } from "../api/items";
import type { Item } from "../types/Item";

interface InventoryTableProps {
  onRefreshRef?: React.MutableRefObject<(() => void) | null>;
  onAction?: () => void;
}

const InventoryTable = ({ onRefreshRef, onAction }: InventoryTableProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const load = async () => {
    const res = await getItems();
    setItems(res.data); // axiosClient always returns {data}
  };

  useEffect(() => {
    load();
  }, []);

  useImperativeHandle(onRefreshRef, () => load, []);

  const setQty = (id: number, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>שם הפריט</Th>
          <Th>כמות</Th>
          <Th>פעולות</Th>
        </Tr>
      </Thead>

      <Tbody>
        {items.map((item) => (
          <Tr key={item.id}>
            <Td>{item.name}</Td>
            <Td>{item.quantity}</Td>

            <Td>
              <Flex gap={2} align="center">
                <Input
                  width="70px"
                  type="number"
                  placeholder="כמות"
                  value={quantities[item.id] ?? ""}
                  onChange={(e) => setQty(item.id, e.target.value)}
                />

                <Button
                  colorScheme="green"
                  onClick={async () => {
                    const amount = quantities[item.id] || 1;
                    await addItem(item.id, amount);
                    if (onAction) onAction();
                  }}
                >
                  ➕
                </Button>

                <Button
                  colorScheme="red"
                  onClick={async () => {
                    const amount = quantities[item.id] || 1;
                    await removeItem(item.id, amount);
                    if (onAction) onAction();
                  }}
                >
                  ➖
                </Button>
              </Flex>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default InventoryTable;
