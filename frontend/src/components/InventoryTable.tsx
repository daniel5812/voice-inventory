import { useEffect, useState, useImperativeHandle } from "react";
import {
  Table, Thead, Tbody, Tr, Th, Td,
  Button, Spinner, Box
} from "@chakra-ui/react";
import type{ Item } from "../types/Item";
import { getItems } from "../api/items";

interface InventoryTableProps {
  onRefreshRef?: React.MutableRefObject<(() => void) | null>;
}

const InventoryTable = ({ onRefreshRef }: InventoryTableProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    setLoading(true);
    const res = await getItems();
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  useImperativeHandle(onRefreshRef, () => loadItems, []);

  if (loading) return <Spinner />;

  return (
    <Box border="1px solid #eee" p={4} borderRadius={6}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Item</Th>
            <Th>Quantity</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>

        <Tbody>
          {items.map((item) => (
            <Tr key={item.id}>
              <Td>{item.name}</Td>
              <Td>{item.quantity}</Td>
              <Td>
                <Button size="sm" colorScheme="green">Add</Button>
                <Button size="sm" ml={2} colorScheme="red">Remove</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default InventoryTable;
