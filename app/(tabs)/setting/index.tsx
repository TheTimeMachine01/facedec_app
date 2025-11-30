import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { Button, Stack, Text, YStack } from "tamagui";


export default function TabTwoScreen() {
  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const { logout } = useAuth();

  return (
    <Stack flex={1} justifyContent='center' alignItems='center'>
      <YStack backgroundColor='$background' flexDirection='row' width='100%' paddingInline='$4' space='$4'>
        <Button
          onPress={handleLogin}
          flex={1}
        >
          <Text>Login</Text>
        </Button>
        <Button
          onPress={logout}
          flex={1}
        >
          <Text>Logout</Text>
        </Button>
      </YStack>
    </Stack>
  );
}
