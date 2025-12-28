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
  Box,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from "@chakra-ui/react";

import { useMemo, useRef, useState } from "react";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import type { Item } from "../types/Item";
import { useInventory } from "../context/InventoryContext";

interface InventoryTableProps {
  search?: string;
}

const InventoryTable = ({ search = "" }: InventoryTableProps) => {
  const toast = useToast();

  const { items, loading, add, remove, removeItem } = useInventory();

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  /* ---------- helpers ---------- */

  const setQty = (id: number, val: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Number(val),
    }));
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  /* ---------- UI ---------- */

  return (
    <>
      <Box bg="white" p={4} borderRadius="lg" shadow="sm">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>שם הפריט</Th>
              <Th>כמות</Th>
              <Th>פעולות</Th>
            </Tr>
          </Thead>

          <Tbody>
            {filteredItems.map((item) => (
              <Tr key={item.id}>
                <Td>{item.name}</Td>
                <Td>{item.quantity}</Td>

                <Td>
                  <Flex gap={3} align="center">
                    <Input
                      width="75px"
                      type="number"
                      placeholder="כמות"
                      value={quantities[item.id] ?? ""}
                      onChange={(e) => setQty(item.id, e.target.value)}
                    />

                    {/* הוספה */}
                    <Button
                      size="sm"
                      colorScheme="green"
                      leftIcon={<FiPlus />}
                      isLoading={loading}
                      onClick={async () => {
                        const amount = quantities[item.id] || 1;
                        await add(item.id, amount);
                        toast({
                          title: "נוסף למלאי",
                          status: "success",
                          duration: 1500,
                        });
                      }}
                    >
                      הוסף
                    </Button>

                    {/* הורדה */}
                    <Button
                      size="sm"
                      colorScheme="red"
                      leftIcon={<FiMinus />}
                      isLoading={loading}
                      onClick={async () => {
                        const amount = quantities[item.id] || 1;
                        await remove(item.id, amount);
                        toast({
                          title: "הוסר מהמלאי",
                          status: "info",
                          duration: 1500,
                        });
                      }}
                    >
                      הורד
                    </Button>

                    {/* מחיקה */}
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="gray"
                      leftIcon={<FiTrash2 />}
                      onClick={() => setDeleteTarget(item)}
                    >
                      מחק
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}

            {!loading && filteredItems.length === 0 && (
              <Tr>
                <Td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                  לא נמצאו פריטים
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* ---------- Delete dialog ---------- */}
      {deleteTarget && (
        <AlertDialog
          isOpen
          leastDestructiveRef={cancelRef}
          onClose={() => setDeleteTarget(null)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                מחיקת פריט
              </AlertDialogHeader>

              <AlertDialogBody>
                האם אתה בטוח שברצונך למחוק את "{deleteTarget.name}"?
                <br />
                פעולה זו אינה ניתנת לשחזור.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setDeleteTarget(null)}>
                  ביטול
                </Button>

                <Button
                  colorScheme="red"
                  ml={3}
                  onClick={async () => {
                    await removeItem(deleteTarget.id);
                    toast({
                      title: "פריט נמחק",
                      status: "warning",
                      duration: 1500,
                    });
                    setDeleteTarget(null);
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
