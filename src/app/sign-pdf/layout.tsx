import { createToolRoute } from "@/lib/seo/tool-route";

const { metadata, ToolRouteLayout } = createToolRoute("/sign-pdf");

export { metadata };
export default ToolRouteLayout;
