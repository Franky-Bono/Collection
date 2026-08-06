import { Box, Button, Center, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";

interface Props {
  hash: string;
}

const SESSION_KEY = "collection-unlocked";

export function LockScreen({ hash }: Props) {
  const [already] = useState(() => sessionStorage.getItem(SESSION_KEY) === hash);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(already);

  const handleUnlock = async () => {
    const enc = new TextEncoder().encode(password);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const computed = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    if (computed === hash) {
      sessionStorage.setItem(SESSION_KEY, hash);
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  if (unlocked) return null;

  return (
    <Center style={{ height: "100vh" }}>
      <Box style={{ width: 320 }}>
        <Stack gap="md">
          <Title order={3} ta="center">Collection</Title>
          <Text size="sm" c="dimmed" ta="center">Enter your password to continue</Text>
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.currentTarget.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            error={error ? "Incorrect password" : undefined}
            autoFocus
          />
          <Button onClick={handleUnlock} disabled={!password}>Unlock</Button>
        </Stack>
      </Box>
    </Center>
  );
}
