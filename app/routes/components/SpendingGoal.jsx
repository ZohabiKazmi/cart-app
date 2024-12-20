import { useState, useCallback } from "react";
import {
  LegacyCard,
  Tabs,
  TextField,
  Text,
  Button,
} from "@shopify/polaris";

export function SpendingGoal({ id, onDelete }) {
  const [spendingGoal, setSpendingGoal] = useState("50");
  const [selectedTab, setSelectedTab] = useState(0);
  const [freeShipping, setFreeShipping] = useState("Free Shipping 🚚");
  const [percentageDiscount, setPercentageDiscount] = useState("5");
  const [fixedAmountDiscount, setFixedAmountDiscount] = useState("5");
  const [announcement, setAnnouncement] = useState(
    "Add {{amount_left}} to get free shipping! 🚚"
  );

  const tabs = [
    { id: "free-shipping", content: "Free Shipping", panelID: "free-shipping-panel" },
    { id: "percent", content: "Percent", panelID: "percent-panel" },
    { id: "fixed-amount", content: "Fixed Amount", panelID: "fixed-amount-panel" },
  ];

  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  const percentDisplay = `${percentageDiscount}% off`;
  const fixedAmountDisplay = `$${fixedAmountDiscount} off`;

  const handleNumericInput = (value) => {
    return value >= 0 ? value : "0"; // Prevent negative inputs
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "0.5rem",
        }}
      >
        <Text variant="headingMd">Spending Goal {id}</Text>
        <Button
          variant="plain"
          tone="critical"
          onClick={() => onDelete(id)}
        >
          Delete Discount
        </Button>
      </div>
      <TextField
        label={`Target Amount ${id}`}
        type="number"
        value={spendingGoal}
        onChange={(value) => setSpendingGoal(handleNumericInput(value))}
        suffix="px"
        autoComplete="off"
      />
      <Text variant="bodyMd" as="p">
        Spending goal in your store's primary currency
      </Text>
      <div style={{ marginTop: "1rem" }}></div>
      <LegacyCard>
        <Tabs
          tabs={tabs}
          selected={selectedTab}
          onSelect={handleTabChange}
          fitted
        >
          <LegacyCard.Section title={tabs[selectedTab].content}>
            {selectedTab === 0 && (
              <>
                <TextField
                  label="Reward Text"
                  type="text"
                  value={freeShipping}
                  onChange={setFreeShipping}
                  autoComplete="off"
                />
                <TextField
                  label="Text before the goal is reached"
                  type="text"
                  value={announcement}
                  onChange={setAnnouncement}
                  autoComplete="off"
                />
              </>
            )}
            {selectedTab === 1 && (
              <>
                <TextField
                  label="Set Percentage for Discount"
                  type="number"
                  value={percentageDiscount}
                  onChange={(value) =>
                    setPercentageDiscount(handleNumericInput(value))
                  }
                  suffix="%"
                  autoComplete="off"
                />
                <TextField
                  label="Reward Text"
                  type="text"
                  value={percentDisplay}
                  onChange={() => {}} // Disabled as it's auto-calculated
                  autoComplete="off"
                />
              </>
            )}
            {selectedTab === 2 && (
              <>
                <TextField
                  label="Set Fixed Amount"
                  type="number"
                  value={fixedAmountDiscount}
                  onChange={(value) =>
                    setFixedAmountDiscount(handleNumericInput(value))
                  }
                  suffix="$"
                  autoComplete="off"
                />
                <TextField
                  label="Reward Text"
                  type="text"
                  value={fixedAmountDisplay}
                  onChange={() => {}} // Disabled as it's auto-calculated
                  autoComplete="off"
                />
              </>
            )}
          </LegacyCard.Section>
        </Tabs>
      </LegacyCard>
    </>
  );
}
