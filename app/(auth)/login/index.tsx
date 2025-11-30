import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'; // For better keyboard handling
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';


// Basic email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth(); // NEW: Get the login function from context

    const handleLogin = async () => {
        setLoading(true);
        setError('');

        // --- Basic Validation ---
        if (!email.trim()) { // Check if email is empty or just whitespace
            setError('Email is required.');
            setLoading(false);
            return;
        }
        if (!emailRegex.test(email)) { // Check email format
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }
        if (!password.trim()) { // Check if password is empty
            setError('Password is required.');
            setLoading(false);
            return;
        }
        // --- End Basic Validation ---

        // --- Replace with your actual authentication logic ---
        console.log('Attempting login with:', { email, password });
        // NEW: Call the login function from AuthContext
        const success = await login(email, password);
        if (!success) {
            // The AuthContext's login function will return false on failure
            setError('Invalid email or password. Please try again.');
        }
        setLoading(false); // Ensure loading state is reset
    };

    return (

        <>
            <AnimatedGradientBackground />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <YStack
                        space="$4"
                        width="100%"
                        maxWidth={400}
                        padding="$6"
                        borderRadius="$6"
                        backgroundColor="$background" // Use your Tamagui theme background
                        shadowColor="$shadowColor" // Use your Tamagui theme shadow color
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={0.1}
                        shadowRadius={3}
                    >
                        <H2 textAlign="center" color="$color" fontWeight='bold' mt='$5'>Welcome Back</H2>
                        <Paragraph textAlign="center" color="$color" mb='$5'>Sign in to continue.</Paragraph>

                        <Input
                            size="$4"
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            borderColor="$borderColor" // Use your Tamagui theme border color
                        />
                        <Input
                            size="$4"
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            borderColor="$borderColor"
                        />

                        {error ? (
                            <Text color="$red9" textAlign='center' fontSize="$3">
                                {error}
                            </Text>
                        ) : null}

                        <Button
                            size="$5"
                            mt='$4'
                            onPress={handleLogin}
                            disabled={loading}
                            theme="blue" // Example of using a theme if defined in your config
                        >
                            <Text>{loading ? 'Logging In...' : 'Login'}</Text>
                        </Button>

                        <XStack justifyContent="center" alignItems="center" space="$2">
                            <Text fontSize="$3" color="$color">Don't have an account?</Text>
                            <Button
                                variant="text"
                                onPress={() => {
                                    // Navigate to Signup screen
                                    console.log('Navigate to Signup');
                                    // Example with Expo Router: router.push('/signup');
                                    router.push('/(auth)/signup');
                                }}
                                color="$blue9" // Use your Tamagui theme blue color
                                paddingHorizontal="$2"
                            >
                                <Text>Sign Up</Text>
                            </Button>
                        </XStack>
                    </YStack>
                </ScrollView>
            </KeyboardAvoidingView>

        </>
    );
}