import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native'; // For showing alerts to the user
import { Button, Dialog, H2, Spinner, Text, XStack, YStack } from 'tamagui';

import { API_ROUTES } from '@/constants/apiRoutes';
import api from '@/services/api';

type Props = {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}


export default function AttendanceModal({ visible, onClose, onSuccess }: Props) {

    const [facing, setFacing] = useState<CameraType>('front');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [userError, setUserError] = useState<string | null>(null);
    const [isShiftActive, setIsShiftActive] = useState(false); // New state to track shift status


    const [userId, setUserId] = useState<string | null>(null);

    // Fetch the authenticated user's ID when the component mounts
    useEffect(() => {
        const fetchUserId = async () => {
            setIsUserLoading(true);
            setUserError(null);

            try {
                // Use the imported `api` instance for the API call
                const response = await api.get('/api/v1/users/me');

                if (response.data) {
                    setUserId(String(response.data.id)); // Convert ID to string to match FormData
                } else {
                    // This case is unlikely with Axios but good for robustness
                    setUserError('Failed to fetch user data. No data in response.');
                    Alert.alert('Error', 'Could not get user details.');
                }
            } catch (error: any) {
                console.error('Error fetching user ID:', error);
                // Handle Axios error structure
                const errorMessage = error.response?.data?.message || 'An error occurred while fetching user data.';
                setUserError(errorMessage);
                Alert.alert('Error', errorMessage);
            } finally {
                setIsUserLoading(false);
            }
        };

        fetchUserId();
    }, []); // Empty dependency array to run only once on mount

    // Show loading spinner if user data is still being fetched
    if (isUserLoading) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" bg="$background">
                <Spinner size="large" color="$color10" />
                <Text mt="$4">Fetching user details...</Text>
            </YStack>
        );
    }

    // Show error if fetching user data failed
    if (userError) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" p="$4" bg="$background">
                <H2 textAlign="center" color="$red9" mb="$4">Error</H2>
                <Text textAlign="center" mb="$4">
                    {userError}
                </Text>
            </YStack>
        );
    }

    // Camera permissions are still loading.
    if (!permission) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" bg="$background">
                <Spinner size="large" color="$color10" />
                <Text mt="$4">Loading permissions...</Text>
            </YStack>
        );
    }

    // Camera permissions are not granted yet.
    if (!permission.granted) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" p="$4" bg="$background">
                <H2 textAlign="center" mb="$4">Permissions Required</H2>
                <Text textAlign="center" mb="$4">
                    We need your permission to access the camera to mark your attendance.
                </Text>
                <Button onPress={requestPermission} theme="blue_alt2" size="$4">
                    Grant Permission
                </Button>
            </YStack>
        );
    }

    // 2. Create the function to handle taking the picture and sending data
    const takePicture = async () => {
        console.log('Mark Attendance button pressed!');

        if (!userId) {
            Alert.alert('Error', 'User details are not available. Please try again.');
            return;
        }

        setIsSubmitting(true);

        if (cameraRef.current) {
            try {
                // Take the picture with no shutter sound
                const photo = await cameraRef.current.takePictureAsync({
                    shutterSound: false
                });

                // 3. Get the current date and time
                // const attendanceTime = new Date().toISOString();
                // const attendanceDate = new Date().toLocaleDateString('en-US');

                if (photo) {
                    console.log('Photo URI:', photo.uri);
                    // console.log('Attendance Time:', attendanceTime);
                    // console.log('Attendance Date:', attendanceDate);

                    const formData = new FormData();

                    formData.append('detectedFace', {
                        uri: photo.uri,
                        name: 'attendance.jpg',
                        type: 'image/jpeg',
                    } as any);
                    formData.append('userId', userId);

                    const response = await api.post(API_ROUTES.MATCH, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    // console.log('API Response:', JSON.stringify(response.data, null, 2)); // Print the JSON response from the server

                    // Handle the response from the backend
                    if (response.data?.status === true) {
                        // Alert.alert('Success', 'Face Matched sucessfully.\nThe score was: ' + response.data?.fcsScore);
                        const fcsScore = response.data?.fcsScore;

                        // Second API call based on shift status
                        try {
                            // API call for shift start (InLog)
                            const inLogPayload = {

                                latitude: 1234.00,
                                longitude: 4321.00,
                                fcss: fcsScore,
                                isFaceMatched: 1,

                            };
                            const inLogResponse = await api.post(API_ROUTES.INLOG, inLogPayload);

                            if (inLogResponse.data?.status === true) {
                                Alert.alert('Shift Started', 'Your shift has been started successfully.');
                                onClose();
                                onSuccess();

                            } else {
                                Alert.alert('Error', inLogResponse.data?.message || 'Failed to start shift.');
                            }
                        } catch (attendanceError: any) {
                            console.error('Error with attendance API:', attendanceError);
                            Alert.alert('Attendance Error', attendanceError.response?.data?.message || 'An error occurred with the attendance API.');
                        }

                    } else {
                        console.error('Server responded with an unexpected payload:', response.data)

                        // Attempt to get more specific error information from the backend
                        const errorMessage = response.data?.message || 'Failed to mark attendance.';
                        Alert.alert('Error', errorMessage);
                    }

                } else {
                    Alert.alert('Error', 'Failed to capture photo.');
                }
            } catch (error: any) {
                console.error('Error taking picture or submitting:', error);

                // --- NEW LOGGING ADDED HERE ---
                console.error('Full Axios Error:', JSON.stringify(error, null, 2));
                // --- END NEW LOGGING ---

                // Handle Axios error structure
                const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
                Alert.alert('Error', errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            console.log('Camera reference is not available yet.');
            Alert.alert('Error', 'Camera is not ready. Please try again.');
            setIsSubmitting(false); // Re-enable if there's an error before the async call
        }
    };

    const cameraSize = 250;

    const handleClose = () => {
        console.log('Modal closing');
        onClose();
    }

    return (
        <Dialog open={visible} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay
                    key="overlay"
                    animation="quick"
                    opacity={0.5}
                    enterStyle={{ opacity: 0 }}
                    exitStyle={{ opacity: 0 }}
                />
                <Dialog.Content
                    key="content"
                    animation="quick"
                    enterStyle={{ scale: 0.9 }}
                    exitStyle={{ scale: 0.9 }}
                    x={0}
                    scale={1}
                    bg="$background" // Apply your background color here
                    p="$6" // Apply padding
                    br="$4" // Apply border radius
                    width="90%" // Apply width
                    elevation={4} // Apply elevation
                >
                <XStack alignItems="center" justifyContent="space-between" mb="$4">
                    <Text fontSize="$4" fontWeight="bold">Mark Attendance</Text>
                    <Button onPress={handleClose} theme="alt" size="$3" rounded>
                        <MaterialCommunityIcons name="close" size={20} color="$color7" />
                    </Button>
                </XStack>
                <YStack alignItems="center" justifyContent="center" mb="$4">
                    <CameraView
                        ref={cameraRef}
                        style={{
                            width: cameraSize,
                            height: cameraSize,
                            borderRadius: cameraSize / 2,
                            overflow: 'hidden',
                        }}
                        facing={facing}
                        animateShutter={false}
                    />
                </YStack>

                    <YStack space="$2" alignItems="center">
                        <Button
                            icon={isSubmitting ? <Spinner /> : <MaterialCommunityIcons name='camera' color={'white'} size={16} />}
                            onPress={takePicture}
                            theme="green_alt2"
                            size="$5"
                            disabled={isSubmitting}
                        >
                            <Text>{isSubmitting ? 'Submitting...' : 'Mark Attendance'}</Text>
                        </Button>
                    </YStack>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
}