import {
  Box,
  Heading,
  Text,
  Stack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Button,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useProfile } from "../hooks/useProfile";

const MIN_NAME_LENGTH = 5;

const Profile = () => {
  const { profile, loading, error, updateProfile } = useProfile();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------
  // Loading / Error (unchanged behavior)
  // ---------------------------------------------------------
  if (loading) {
    return (
      <Box p={6}>
        <Spinner />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          Failed to load profile
        </Alert>
      </Box>
    );
  }

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------
  const validateFullName = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "Full name cannot be empty";
    }

    if (trimmed.length < MIN_NAME_LENGTH) {
      return `Full name must be at least ${MIN_NAME_LENGTH} characters`;
    }

    return null;
  };

  // ---------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------
  const startEdit = () => {
    setFullName(profile.fullName || "");
    setNameError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFullName(profile.fullName || "");
    setNameError(null);
  };

  const handleChange = (value: string) => {
    setFullName(value);
    setNameError(validateFullName(value));
  };

  const saveEdit = async () => {
    const validationError = validateFullName(fullName);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    try {
      setSaving(true);
      await updateProfile(fullName.trim());

      toast({
        title: "Profile updated",
        status: "success",
        duration: 2000,
      });

      setIsEditing(false);
    } catch {
      toast({
        title: "Failed to update profile",
        status: "error",
        duration: 2000,
      });
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <Box p={6} maxW="600px">
      <Heading size="lg" mb={6}>
        Personal Area
      </Heading>

      <Stack spacing={4}>
        <Divider />

        {/* Email */}
        <Box>
          <Text fontSize="sm" color="gray.500">
            Email
          </Text>
          <Text fontWeight="medium">{profile.email}</Text>
        </Box>

        <Divider />

        {/* Full Name */}
        <Box>
          <Text fontSize="sm" color="gray.500">
            Full Name
          </Text>

          {!isEditing ? (
            <HStack justify="space-between">
              <Text fontWeight="medium">
                {profile.fullName || "Not set"}
              </Text>
              <Button size="sm" onClick={startEdit}>
                Edit
              </Button>
            </HStack>
          ) : (
            <Stack spacing={2}>
              <Input
                value={fullName}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Enter full name"
              />

              {nameError && (
                <Text fontSize="sm" color="red.500">
                  {nameError}
                </Text>
              )}

              <HStack>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={saveEdit}
                  isLoading={saving}
                  isDisabled={!!nameError}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cancelEdit}
                  isDisabled={saving}
                >
                  Cancel
                </Button>
              </HStack>
            </Stack>
          )}
        </Box>

        <Divider />

        {/* Created At */}
        <Box>
          <Text fontSize="sm" color="gray.500">
            Joined
          </Text>
          <Text fontSize="sm" color="gray.600">
            {new Date(profile.createdAt).toLocaleDateString()}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default Profile;
