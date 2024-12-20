import { useState, useCallback } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Frame,
  Page,
  Layout,
  LegacyCard,
  LegacyTabs,
  Button,
  TextField,
  Text,
  Divider,
  BlockStack,
  Tabs,
  Box,
  ColorPicker,
  Toast,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { SpendingGoal } from "./components/SpendingGoal";
// import { Color } from "./components/Color";

export default function Index() {
  const fetcher = useFetcher();

  const [selectedTab, setSelectedTab] = useState(0);
  // Initial spending goals
  const [spendingGoals, setSpendingGoals] = useState([{ id: 1 }, { id: 2 }]);

  const [boxStroke, setBoxStroke] = useState("6");
  const [cornerRadius, setCornerRadius] = useState("5");
  const [borderWidth, setBorderWidth] = useState("1");
  const [borderRadius, setBorderRadius] = useState("10");

  // Tab Change Handler
  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  const handleAddSpendingGoal = () => {
    setSpendingGoals([...spendingGoals, { id: spendingGoals.length + 1 }]);
  };

  const handleDeleteSpendingGoal = (id) => {
    if (spendingGoals.length > 1) {
      setSpendingGoals(spendingGoals.filter((goal) => goal.id !== id));
    } else {
      alert("At least one discount is required.");
    }
  };

  const tabs = [
    { id: "content", content: "Content", panelID: "content-panel" },
    { id: "design", content: "Design", panelID: "design-panel" },
  ];

  // Color for design
  const [color, setColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });

  

  // Convert HSB to Hex
  const hsbToHex = useCallback((hsb) => {
    const { hue, saturation, brightness, alpha } = hsb;

    // Convert HSB to RGB
    const h = hue / 360;
    const s = saturation;
    const v = brightness;

    let r, g, b;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        [r, g, b] = [v, t, p];
        break;
      case 1:
        [r, g, b] = [q, v, p];
        break;
      case 2:
        [r, g, b] = [p, v, t];
        break;
      case 3:
        [r, g, b] = [p, q, v];
        break;
      case 4:
        [r, g, b] = [t, p, v];
        break;
      case 5:
        [r, g, b] = [v, p, q];
        break;
    }

    // Convert to hex
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  // Convert Hex to HSB
  const hexToHsb = useCallback(
    (hex) => {
      // Remove # if present
      hex = hex.replace(/^#/, "");

      // Parse hex to RGB
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;

      let h, s, v;

      v = max;
      s = max === 0 ? 0 : d / max;

      if (max === min) {
        h = 0;
      } else {
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h *= 60;
      }

      return {
        hue: h,
        saturation: s,
        brightness: v,
        alpha: color.alpha, // Preserve existing alpha
      };
    },
    [color.alpha],
  );

  // Handle color picker change
  const handleColorChange = useCallback((newColor) => {
    setColor(newColor);
  }, []);

  // Handle hex input change
  const handleHexChange = useCallback(
    (newHex) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(newHex)) {
        setColor(hexToHsb(newHex));
      }
    },
    [hexToHsb],
  );

  // Inside the component, add state for loading and toast
  const [isLoading, setIsLoading] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Update the handleSave function
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    const settings = {
      spendingGoals: spendingGoals.map((goal) => ({
        spendingGoal: goal.spendingGoal,
        announcement: goal.announcement,
        selectedTab: goal.selectedTab,
        freeShipping: goal.freeShipping,
        percentageDiscount: goal.percentageDiscount,
        percent: goal.percent,
        fixedAmountDiscount: goal.fixedAmountDiscount,
        fixedAmount: goal.fixedAmount,
      })),
      design: {
        color: hsbToHex(color),
        boxStroke,
        cornerRadius,
        borderWidth,
        borderRadius,
      },
    };

    try {
      const response = await fetcher.submit(
        { settings: JSON.stringify(settings) },
        { method: "post", action: "/api/settings" },
      );

      setToastMessage("Settings saved successfully");
      setToastError(false);
    } catch (error) {
      setToastMessage("Failed to save settings");
      setToastError(true);
    } finally {
      setIsLoading(false);
      setToastActive(true);
    }
  }, [
    spendingGoals,
    color,
    boxStroke,
    cornerRadius,
    borderWidth,
    borderRadius,
    fetcher,
    hsbToHex,
  ]);

  // Add a toast component
  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      error={toastError}
      onDismiss={() => setToastActive(false)}
    />
  ) : null;

  return (
    <Frame>
      <Page>
        <TitleBar
          title="Cart App"
          primaryAction={{
            content: "Save",
            onAction: handleSave,
            loading: isLoading,
          }}
        />
        <BlockStack gap="500">
          <Layout>
            <Layout.Section>
              <LegacyCard>
                <LegacyTabs
                  tabs={tabs}
                  selected={selectedTab}
                  onSelect={handleTabChange}
                  fitted
                >
                  <LegacyCard.Section title={tabs[selectedTab].content}>
                    {selectedTab === 0 ? (
                      <>
                        {/* Dynamic Spending Goals */}
                        {spendingGoals.map((goal) => (
                          <SpendingGoal
                            key={goal.id}
                            id={goal.id}
                            onDelete={handleDeleteSpendingGoal}
                          />
                        ))}
                        <div style={{ margin: "1rem 0 0 0" }}>
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={handleAddSpendingGoal}
                          >
                            Add new discount
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Design Fields */}
                        <Box
                          style={{
                            display: "flex",
                            gap: "20px",
                            alignItems: "center",
                          }}
                        >
                          <TextField
                            label="Progress bar thickness"
                            type="number"
                            value={boxStroke}
                            onChange={(value) => setBoxStroke(value)}
                            suffix="px"
                            autoComplete="off"
                            style={{ width: "120px" }}
                          />
                          <Text variant="bodyMd" as="p" color="subdued">
                            Thickness in pixels
                          </Text>
                        </Box>

                        <Box
                          style={{
                            display: "flex",
                            gap: "20px",
                            alignItems: "center",
                          }}
                        >
                          <TextField
                            label="Corner Radius"
                            type="number"
                            value={cornerRadius}
                            onChange={(value) => setCornerRadius(value)}
                            suffix="px"
                            autoComplete="off"
                            style={{ width: "120px" }}
                          />
                          <Text variant="bodyMd" as="p">
                            Radius in pixels
                          </Text>
                        </Box>

                        <Box
                          style={{
                            display: "flex",
                            gap: "20px",
                            alignItems: "center",
                          }}
                        >
                          <TextField
                            label="Border Width"
                            type="number"
                            value={borderWidth}
                            onChange={(value) => setBorderWidth(value)}
                            suffix="px"
                            autoComplete="off"
                            style={{ width: "120px" }}
                          />
                          <Text variant="bodyMd" as="p" color="subdued">
                            Width in pixels
                          </Text>
                        </Box>

                        <Box
                          style={{
                            display: "flex",
                            gap: "20px",
                            alignItems: "center",
                          }}
                        >
                          <TextField
                            label="Border Radius"
                            type="number"
                            value={borderRadius}
                            onChange={(value) => setBorderRadius(value)}
                            suffix="px"
                            autoComplete="off"
                            style={{ width: "120px" }}
                          />
                          <Text variant="bodyMd" as="p" color="subdued">
                            Radius in pixels
                          </Text>
                        </Box>

                        <div style={{ margin: "1rem 0" }}>
                          <Divider />
                        </div>

                        <Box gap="200px">
                          <Text variant="headingMd" as="p">
                            Colors
                          </Text>
                          <div style={{ position: "relative" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "1rem",
                                alignItems: "center",
                              }}
                            >
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const picker = document.getElementById(
                                    "color_picker_container",
                                  );
                                  picker.style.display = "block";

                                  const handleClickOutside = (event) => {
                                    if (
                                      !event.target.closest(
                                        "#color_picker_container",
                                      )
                                    ) {
                                      picker.style.display = "none";
                                      document.removeEventListener(
                                        "click",
                                        handleClickOutside,
                                      );
                                    }
                                  };

                                  // Add the listener on the next tick to avoid immediate trigger
                                  setTimeout(() => {
                                    document.addEventListener(
                                      "click",
                                      handleClickOutside,
                                    );
                                  }, 0);
                                }}
                                style={{
                                  width: "6rem",
                                  height: "2.5rem",
                                  backgroundColor: `hsla(${color.hue}, ${color.saturation * 100}%, ${color.brightness * 100}%, ${color.alpha})`,
                                  border: "1px solid lightgray",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                }}
                              />
                            </div>
                            <div
                              id="color_picker_container"
                              style={{
                                display: "none",
                                position: "fixed",
                                zIndex: 1000,
                                background: "white",
                                padding: "1rem",
                                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                                borderRadius: "8px",
                              }}
                            >
                              <ColorPicker
                                onChange={handleColorChange}
                                color={color}
                                allowAlpha
                              />
                              <TextField
                                label="Hex Color"
                                value={hsbToHex(color)}
                                onChange={handleHexChange}
                                autoComplete="off"
                                placeholder="#000000"
                                maxLength={7}
                              />
                            </div>
                          </div>
                        </Box>

                        {/* <Color/> */}
                      </>
                    )}
                  </LegacyCard.Section>
                </LegacyTabs>
              </LegacyCard>
              <div style={{ marginTop: "1rem" }}>
                <Button
                  primary
                  fullWidth
                  onClick={handleSave}
                  loading={isLoading}
                >
                  Save Settings
                </Button>
              </div>
            </Layout.Section>
          </Layout>
        </BlockStack>
        {toastMarkup}
      </Page>
    </Frame>
  );
}
