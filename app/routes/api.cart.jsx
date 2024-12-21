// import { json } from "@remix-run/node";
// import { authenticate } from "../shopify.server";


// export const loader = async ({ request }) => {
//   const { admin, session } = await authenticate.admin(request);

//   try {
//     const response = await admin.graphql(`
//       query getMetafields($ownerId: ID!) {
//         shop {
//           metafields(
//             first: 10
//             namespace: "cart-app"
//             keys: ["spending_goals", "design_settings"]
//           ) {
//             edges {
//               node {
//                 key
//                 value
//               }
//             }
//           }
//         }
//       }
//     `, {
//       variables: {
//         ownerId: session.shop
//       }
//     });

//     const { data } = await response.json();
//     const metafields = data.shop.metafields.edges.reduce((acc, edge) => {
//       acc[edge.node.key] = JSON.parse(edge.node.value);
//       return acc;
//     }, {});

//     return json({
//       spendingGoals: metafields.spending_goals || [],
//       design: metafields.design_settings || {}
//     });
//   } catch (error) {
//     console.error("Error loading settings:", error);
//     return json(
//       { status: "error", message: error.message },
//       { status: 500 }
//     );
//   }
// };



// export const action = async ({ request }) => {
//   const { admin, session } = await authenticate.admin(request);
//   const formData = await request.formData();
//   const settings = JSON.parse(formData.get("settings"));

//   try {
//     // Save spending goals metafield
//     await admin.graphql(`
//       mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
//         metafieldsSet(metafields: $metafields) {
//           metafields {
//             key
//             namespace
//             value
//           }
//           userErrors {
//             field
//             message
//           }
//         }
//       }
//     `, {
//       variables: {
//         metafields: [
//           {
//             namespace: "discount_progress_bars",
//             key: "spending_goals",
//             value: JSON.stringify(settings.spendingGoals),
//             type: "json",
//             ownerId: session.shop
//           },
//           {
//             namespace: "discount_progress_bars",
//             key: "design_settings",
//             value: JSON.stringify(settings.design),
//             type: "json",
//             ownerId: session.shop
//           }
//         ]
//       }
//     });

//     return json({ status: "success" });
//   } catch (error) {
//     console.error("Error saving settings:", error);
//     return json(
//       { status: "error", message: error.message },
//       { status: 500 }
//     );
//   }
// };




import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    // Get app installation ID
    const appResponse = await admin.graphql(`
      query {
        currentAppInstallation {
          id
        }
      }
    `);
    
    const appData = await appResponse.json();
    const appId = appData.data.currentAppInstallation.id;

    // Query metafields with proper type definition
    const response = await admin.graphql(`
      query {
        currentAppInstallation {
          metafields(first: 10, namespace: "cart-app") {
            edges {
              node {
                id
                namespace
                key
                value
                type
              }
            }
          }
        }
      }
    `);

    const { data } = await response.json();
    console.log('Raw metafields response:', data);

    const metafields = {};
    data.currentAppInstallation.metafields.edges.forEach(edge => {
      try {
        metafields[edge.node.key] = JSON.parse(edge.node.value);
      } catch (e) {
        console.error(`Error parsing metafield ${edge.node.key}:`, e);
        metafields[edge.node.key] = edge.node.value;
      }
    });

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
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const settings = JSON.parse(formData.get("settings"));

  try {
    // Get app installation ID
    const appResponse = await admin.graphql(`
      query {
        currentAppInstallation {
          id
        }
      }
    `);
    
    const appData = await appResponse.json();
    const appId = appData.data.currentAppInstallation.id;

    // Delete existing metafields first
    await admin.graphql(`
      mutation metafieldsDelete($metafields: [MetafieldsDeleteInput!]!) {
        metafieldsDelete(metafields: $metafields) {
          deletedCount
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        metafields: [
          { ownerId: appId, namespace: "cart-app", key: "spending_goals" },
          { ownerId: appId, namespace: "cart-app", key: "design_settings" }
        ]
      }
    });

    // Create new metafields
    const response = await admin.graphql(`
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            type
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
            ownerId: appId,
            namespace: "cart-app",
            key: "spending_goals",
            type: "json",
            value: JSON.stringify(settings.spendingGoals)
          },
          {
            ownerId: appId,
            namespace: "cart-app",
            key: "design_settings",
            type: "json",
            value: JSON.stringify(settings.design)
          }
        ]
      }
    });

    const result = await response.json();
    console.log('Metafield save response:', result);

    if (result.data?.metafieldsSet?.userErrors?.length > 0) {
      throw new Error(JSON.stringify(result.data.metafieldsSet.userErrors));
    }

    return json({ status: "success", data: result.data });
  } catch (error) {
    console.error("Error saving settings:", error);
    return json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
};