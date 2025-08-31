import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { characteristicsStyles } from '../styles';

interface CharacteristicsListProps {
  characteristics: any[];
}

export const CharacteristicsList: React.FC<CharacteristicsListProps> = ({
  characteristics
}) => {
  if (characteristics.length === 0) {
    return null;
  }

  const renderCharacteristic = (char: any, index: number) => (
    <View key={index} style={characteristicsStyles.characteristicCard}>
      <ThemedText style={characteristicsStyles.characteristicUuid}>
        {char.uuid}
      </ThemedText>
      <View style={characteristicsStyles.characteristicProperties}>
        <View style={[
          characteristicsStyles.propertyBadge,
          char.isReadable && characteristicsStyles.propertyActive
        ]}>
          <ThemedText style={[
            characteristicsStyles.propertyText,
            char.isReadable && characteristicsStyles.propertyTextActive
          ]}>
            READ
          </ThemedText>
        </View>
        <View style={[
          characteristicsStyles.propertyBadge,
          (char.isWritableWithResponse || char.isWritableWithoutResponse) && characteristicsStyles.propertyActive
        ]}>
          <ThemedText style={[
            characteristicsStyles.propertyText,
            (char.isWritableWithResponse || char.isWritableWithoutResponse) && characteristicsStyles.propertyTextActive
          ]}>
            WRITE
          </ThemedText>
        </View>
        <View style={[
          characteristicsStyles.propertyBadge,
          char.isNotifiable && characteristicsStyles.propertyActive
        ]}>
          <ThemedText style={[
            characteristicsStyles.propertyText,
            char.isNotifiable && characteristicsStyles.propertyTextActive
          ]}>
            NOTIFY
          </ThemedText>
        </View>
        <View style={[
          characteristicsStyles.propertyBadge,
          char.isIndicatable && characteristicsStyles.propertyActive
        ]}>
          <ThemedText style={[
            characteristicsStyles.propertyText,
            char.isIndicatable && characteristicsStyles.propertyTextActive
          ]}>
            INDICATE
          </ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={characteristicsStyles.characteristicsSection}>
      <ThemedText style={characteristicsStyles.characteristicsTitle}>
        ⚡ Characteristics
      </ThemedText>
      <View style={characteristicsStyles.characteristicsList}>
        {characteristics.map(renderCharacteristic)}
      </View>
    </View>
  );
};
