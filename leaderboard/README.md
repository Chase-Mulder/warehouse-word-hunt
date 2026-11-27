# Leaderboard setup (about 5 minutes)

The leaderboard stores finish times in a Google Sheet you own. GitHub Pages can't save data, so a small Apps Script acts as the backend.

1. Go to sheets.new and create a blank sheet. Name it something like "Warehouse Word Hunt Scores".
2. Open **Extensions > Apps Script**. Delete the sample code, paste in all of `apps-script.gs`, and click **Save**.
3. Click **Deploy > New deployment**. Click the gear icon, choose **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, authorize when asked (choose Advanced > Go to project if Google warns you), and copy the **Web app URL**. It ends in `/exec`.
5. In `index.html`, find `const LB_URL='';` and paste the URL between the quotes. Commit and push.

The script creates a **Scores** tab on the first finish. To remove a fake or test time, delete its row in the sheet. The page refreshes the board every 30 seconds.

Notes:
- If you edit the script later, use **Deploy > Manage deployments > Edit > Version: New version**. That keeps the same URL.
- A work Google account may block "Anyone" access. If it does, use a personal Gmail account.
- Each team's best time is shown. Times under 2 minutes are rejected.
- Pressing **Reset game** on a computer lets that team play again and post another time.
