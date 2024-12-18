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
  const [percent, setPercent] = useState("");
  const [fixedAmountDiscount, setFixedAmountDiscount] = useState("5");
  const [fixedAmount, setFixedAmount] = useState("");
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
          // disabled={id === 1} 
        >
          Delete Discount
        </Button>
      </div>
      <TextField
        label={`Target Amount ${id}`}
        type="number"
        value={spendingGoal}
        onChange={(value) => setSpendingGoal(value)}
        suffix="px"
        autoComplete="off"
      />
      <Text variant="bodyMd" as="p">
        Spending goal in your store's primary currency
      </Text>
      <div style={{marginTop: "1rem"}}></div>
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
                  onChange={(value) => setFreeShipping(value)}
                  autoComplete="off"
                />
                <TextField
                  label="Text before the goal is reached"
                  type="text"
                  value={announcement}
                  onChange={(value) => setAnnouncement(value)}
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
                  onChange={(value) => setPercentageDiscount(value)}
                  suffix="%"
                  autoComplete="off"
                />
                <TextField
                  label="Reward Text"
                  type="text"
                  value={percent || `${percentageDiscount}% off`}
                  onChange={(value) => setPercent(value)}
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
                  onChange={(value) => setFixedAmountDiscount(value)}
                  suffix="$"
                  autoComplete="off"
                />
                <TextField
                  label="Reward Text"
                  type="text"
                  value={fixedAmount || `$${fixedAmountDiscount} off`}
                  onChange={(value) => setFixedAmount(value)}
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
