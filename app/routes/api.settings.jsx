import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";


export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  try {
    const response = await admin.graphql(`
      query getMetafields($ownerId: ID!) {
        shop {
          metafields(
            first: 10
            namespace: "discount_progress_bars"
            keys: ["spending_goals", "design_settings"]
          ) {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    `, {
      variables: {
        ownerId: session.shop
      }
    });

    const { data } = await response.json();
    const metafields = data.shop.metafields.edges.reduce((acc, edge) => {
      acc[edge.node.key] = JSON.parse(edge.node.value);
      return acc;
    }, {});

    return json({
      spendingGoals: metafields.spending_goals || [],
      design: metafields.design_settings || {}
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    return json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
};



export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const settings = JSON.parse(formData.get("settings"));

  try {
    // Save spending goals metafield
    await admin.graphql(`
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        metafields: [
          {
            namespace: "discount_progress_bars",
            key: "spending_goals",
            value: JSON.stringify(settings.spendingGoals),
            type: "json",
            ownerId: session.shop
          },
          {
            namespace: "discount_progress_bars",
            key: "design_settings",
            value: JSON.stringify(settings.design),
            type: "json",
            ownerId: session.shop
          }
        ]
      }
    });

    return json({ status: "success" });
  } catch (error) {
    console.error("Error saving settings:", error);
    return json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
};

