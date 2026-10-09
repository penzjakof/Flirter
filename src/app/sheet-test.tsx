import { View } from 'react-native';
import { InsufficientEnergySheet } from '@/components/energy/insufficient-energy-sheet';

export default function SheetTestPage() {
  return (
    <View style={{ flex: 1, backgroundColor: 'blue' }}>
      <InsufficientEnergySheet visible={true} requiredAmount={1} actionLabel="test" onClose={() => {}} />
    </View>
  );
}
