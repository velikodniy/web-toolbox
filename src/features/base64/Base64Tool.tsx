import React from 'react';
import {
  BidirectionalConverter,
  ToolPageLayout,
} from '../../components/ui/index.ts';

const encode = (input: string) => {
  try {
    return { success: true as const, value: btoa(input) };
  } catch {
    return { success: false as const, error: 'Failed to encode.' };
  }
};

const decode = (input: string) => {
  try {
    return { success: true as const, value: atob(input) };
  } catch {
    return { success: false as const, error: 'Invalid Base64 string.' };
  }
};

const Base64Tool: React.FC = () => {
  return (
    <ToolPageLayout
      title='Base64 Encoder/Decoder'
      description='Real-time bidirectional Base64 conversion. Type in either box to convert.'
    >
      <BidirectionalConverter
        encode={encode}
        decode={decode}
        labels={{ decoded: 'Text / Raw', encoded: 'Base64' }}
        placeholders={{
          decoded: 'Type text here...',
          encoded: 'Type Base64 here...',
        }}
      />
    </ToolPageLayout>
  );
};

export default Base64Tool;
