import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Adapt, Button, Dialog, Input, Select, Sheet, Text, XStack } from 'tamagui';

type Props = {
  visible: boolean;
  onClose: () => void;
  date: string;
  day: string;
  inTime: string;
  outTime: string;
  status: string;
  onSubmit: (data: { inTime: string; outTime: string; status: string; reason: string }) => void;
};

const statusOptions = [
  { value: 'P' , label: 'Present', },
  { value: 'L' , label: 'Late', },
  { value: 'A' , label: 'Absent', },
  { value: 'NA', label: 'Not Available',  },
  { value: 'CH', label: 'Company Holiday',  },
];

export default function RequestChangeModal({
  visible,
  onClose,
  date,
  day,
  inTime,
  outTime,
  status,
  onSubmit,
}: Props) {
  const [newIn, setNewIn] = useState(inTime || '');
  const [newOut, setNewOut] = useState(outTime || '');

  const [newStatus, setNewStatus] = React.useState(status || '');

  const [reason, setReason] = useState('');

  useEffect(() => {
    if (visible) {
      setNewIn(inTime);
      setNewOut(outTime);
      setNewStatus(status);
      setReason(''); // Clear reason when opening for a new request
    }
  }, [visible, inTime, outTime, status]);

  const handleSubmit = () => {
    if (!reason.trim()) { // Basic validation for reason
      alert('Reason for change is required!');
      return;
    }
    onSubmit({ inTime: newIn, outTime: newOut, status: newStatus, reason: reason });
    onClose();
  };

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
          bg="$color2" // Apply your background color here
          p="$6" // Apply padding
          br="$4" // Apply border radius
          width="90%" // Apply width
          elevation={4} // Apply elevation
        >
          <Text fontWeight="bold" fontSize="$7" mb="$2">Request Change</Text>
          <Text mb="$2">{day}, {date}</Text>
          <Input
            placeholder="New In Time (e.g. 09:00 AM)"
            value={newIn}
            onChangeText={setNewIn}
            mb="$2"
          />
          <Input
            placeholder="New Out Time (e.g. 06:00 PM)"
            value={newOut}
            onChangeText={setNewOut}
            mb="$2"
          />
          <Select
            value={newStatus}
            onValueChange={setNewStatus}
            disablePreventBodyScroll
            mb="$2"
          >
            <Select.Trigger minWidth={200} iconAfter={<MaterialCommunityIcons name="chevron-down" size={18} />}>
              <Select.Value placeholder="Select status" />
            </Select.Trigger>

            <Adapt when="maxMd" platform="touch">
              <Sheet native={true} modal dismissOnSnapToBottom animation="medium">
                <Sheet.Frame>
                  <ScrollView>
                    <Adapt.Contents />
                  </ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay
                  bg="$white1"
                  animation="lazy"
                  enterStyle={{ opacity: 0 }}
                  exitStyle={{ opacity: 0 }}
                />
              </Sheet>
            </Adapt>
            
            <Select.Content zIndex={200000}>
              <Select.Viewport minWidth={200}>
                <Select.Group>
                  <Select.Label>Status</Select.Label>
                  {React.useMemo(
                    () =>
                      statusOptions.map((item, i) => {
                        return (
                          <Select.Item
                            index={i}
                            key={item.label}
                            value={item.value}
                          >
                            <Select.ItemText color="$white1">{item.label} - {item.value}</Select.ItemText>
                            <Select.ItemIndicator marginLeft="auto" background="#facc15" p={'$2'}>
                              <MaterialCommunityIcons name='check' color={'white'} size={16} />
                            </Select.ItemIndicator>
                          </Select.Item>
                        )
                      }),
                      [statusOptions]
                  )}
                </Select.Group>
              </Select.Viewport>
            </Select.Content>
          </Select>
          <Input
            placeholder="Reason for change (required)"
            value={reason}
            onChangeText={setReason}
            mb="$4"
            mt={"$2"}
          />
          <XStack justifyContent="flex-end" gap="$2">
            <Button onPress={handleClose} bg="$black10">Cancel</Button>
            <Button onPress={handleSubmit} bg="$blue10">Submit</Button>
          </XStack>


        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
