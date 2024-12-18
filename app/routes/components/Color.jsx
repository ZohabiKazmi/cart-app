import { useState } from "react";
import { TextField, LegacyCard } from "@shopify/polaris";
import { HexColorPicker, HexColorInput } from "react-colorful";

export default function Color() {
  const [hexColor, setHexColor] = useState("#e7e5e5");
  const [opacity, setOpacity] = useState("100");

  const handleOpacityChange = (value) => {
    // Ensure opacity is between 0 and 100
    const sanitizedValue = Math.min(Math.max(Number(value), 0), 100);
    setOpacity(sanitizedValue.toString());
  };

  return (
    <LegacyCard title="Color Picker" sectioned>
      {/* <Stack> */}
        {/* Color Picker */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <HexColorPicker color={hexColor} onChange={setHexColor} />
          </div>
          <div style={{ flex: 1 }}>
            {/* HEX Input */}
            <TextField
              label="HEX Color"
              value={hexColor}
              onChange={setHexColor}
              autoComplete="off"
              placeholder="#000000"
              maxLength={7}
            />
            {/* Opacity Input */}
            <TextField
              label="Opacity"
              value={opacity}
              type="number"
              onChange={handleOpacityChange}
              suffix="%"
              autoComplete="off"
              min={0}
              max={100}
            />
          </div>
        </div>
      {/* </Stack> */}
    </LegacyCard>
  );
}
