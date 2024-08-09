import { WebflowClient } from "webflow-api";

const accessToken = WebflowClient.getAccessToken({
  clientId: process.env.WEBFLOW_CLIENT_ID,
  clientSecret: process.env.WEBFLOW_SECRET,
  code: "Bearer c6cf4c0a73ee2b82259e252c4fae3c1f78abf766660bb6c5f96c7e3b2a653a90"

});
