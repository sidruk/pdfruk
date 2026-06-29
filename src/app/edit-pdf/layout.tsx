import { createToolRoute } from "@/lib/seo/tool-route";

const { metadata, ToolRouteLayout } = createToolRoute("/edit-pdf");

export { metadata };
export default ToolRouteLayout;
