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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

import { useEffect, useState, useImperativeHandle, useRef } from "react";

import { getItems, addItem, removeItem, deleteItem } from "../api/items";
import type { Item } from "../types/Item";

interface InventoryTableProps {
  onRefreshRef?: React.MutableRefObject<(() => void) | null>;
  onAction?: () => void;
}

const InventoryTable = ({ onRefreshRef, onAction }: InventoryTableProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // טעינת המלאי
  const load = async () => {
    const res = await getItems();
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  useImperativeHandle(onRefreshRef, () => load, []);

  const setQty = (id: number, val: string) => {
    setQuantities((prev) => ({ ...prev, [id]: Number(val) }));
  };

  return (
    <>
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
                  {/* קלט כמות */}
                  <Input
                    width="70px"
                    type="number"
                    placeholder="כמות"
                    value={quantities[item.id] ?? ""}
                    onChange={(e) => setQty(item.id, e.target.value)}
                  />

                  {/* הוספה */}
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

                  {/* הורדה */}
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

                  {/* מחיקה */}
                  <Button colorScheme="gray" onClick={() => setDeleteTarget(item)}>
                    🗑️
                  </Button>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* חלון אישור למחיקה */}
      {deleteTarget && (
        <AlertDialog
          isOpen={true}
          leastDestructiveRef={cancelRef}
          onClose={() => setDeleteTarget(null)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                מחיקת פריט
              </AlertDialogHeader>

              <AlertDialogBody>
                האם אתה בטוח שתרצה למחוק את "{deleteTarget.name}"?
                פעולה זו בלתי הפיכה.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setDeleteTarget(null)}>
                  ביטול
                </Button>
                <Button
                  colorScheme="red"
                  ml={3}
                  onClick={async () => {
                    await deleteItem(deleteTarget.id);
                    setDeleteTarget(null);
                    if (onAction) onAction();
                  }}
                >
                  מחיקה
                </Button>
              </AlertDialogFooter>

            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </>
  );
};

export default InventoryTable;
