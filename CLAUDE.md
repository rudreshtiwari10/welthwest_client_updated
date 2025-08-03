# Claude Prompts and Instructions

## Initial Prompt
```
@WelthWestClientSharing\ now understand this i want to fetch all saved data of user report like backtesting saved strategy and AI analysis on /dashboard page in which already section for these are made and just connect properly those API to fetcha and show data. also check first that API workflow is clean like when user backtest or AI analyis then after a save button should be shown and after cliking on it it should be asked a name to strategy then save it to save endpoint for AI analysis or if backtesting. then it should be fethced in /dashboard page with respective sections. so make it working without error. check API in @WelthWestServer2\
```

## Follow-up Instructions
```
so when i checkd in AI analysis and backtesting page and saed strategy so its saving and also API is being called at backedn but when i checked it on dashboard its not showing saved strategy. so can you check why this issue is coming and also do one more thing that make a claude.md and progress.md file in which add whatever promot given to claude so far and in progress.md save all progress like whatever changed and all done. but first fix this save fetch on dashboard in @WelthWestClientSharing\src\pages\DashboardPage.tsx and also i checkd when usr click on those back test and AI analysis bitton API is calling but data is not showing so fix all issue just fetch me saved data anyhow
```

## Third Follow-up Instructions
```
@WelthWestClientSharing i saw in console that its fetching backtesitng result and AI analysis but some fitlering is working on that i want all backtested strategy saved by user to be shown no filter on that just show whatever data is available on that user id for AI analysis and backtesitng
```

## Fourth Follow-up Instructions
```
@WelthWestClientSharing\ so now i am getting issue in graph of market overview section like its changing or shaking in periods so i dont want that to be dynmaic it should be fixed graph so can you find out problem and fix it.
```

## Fifth Follow-up Instructions
```
@WelthWestClientSharing\ now can you remove all those APi calling from frontend for backtest and Analayis section in /dashboard and make a new connection of this and this time first analyse how many and which parameter are coming from both saved API adn make a new element to show case thos values then put those value in that places and the  show data now this time evertthing should be perfect and working.
```

## Sixth Follow-up Instructions
```
@WelthWestClientSharing\ i want to fix this navbar search bar suggestion feature like when user start typing word then automatically it should show all available stocks related and starting with that word typed and so on when continue typeing. so can you check in @WelthWestServer2\ and client what all will be needed to make this happend and make it working.
```

## Seventh Follow-up Instructions (Current)
```
@WelthWestClientSharing\ i am making payment method pages with having user details before that and also fetch user details from logged in id like user must have logged in before checking out page of details so fetch email name etc from there and follow rest below: \
\
Plan Details & User Info Form

After clicking "upgarde," direct to a details page for that plan.

Show plan name, price, billing cycle (monthly/annual), and feature highlights.

Include a form to collect:
– Full name
–  email
-Role/Title (e.g., Trader, Investor, Instiunal) (optional)
– Phone number 
– Country (for tax/VAT rules)

Show checkboxes for "Agree to Terms" and GDPR consent if needed.

"Continue to Payment" button only active once form validated.

Review & Payment Method Page

Display a summary: plan, price, user info.

Allow choice of payment method (Razorpay, UPI, card).

A "Change Details" link to go back and edit form.

A "Proceed to Pay" button that opens Razorpay Checkout.

Razorpay Checkout Integration

Load https://checkout.razorpay.com/v1/checkout.js.

Pass options: key, amount (in paise), currency, name, description, image, order_id, and prefill from your form.

On success, Razorpay returns razorpay_payment_id, razorpay_order_id, and razorpay_signature.

Immediately POST these three to your /api/payment/verify endpoint (plus plan and user context).

Confirmation & Thank You Page

After backend verifies signature, show "Payment Successful" page.

Display plan details, next steps (e.g., invite team, start onboarding).

Include "Go to Dashboard" and "Download Invoice" buttons.

Email Notification & Dashboard Update

Send a transactional email (via your backend) confirming subscription and invoice.

On user dashboard, update subscription status and unlock features.
after this payment verifiaction user must be changed to selected upgarded plan and should replicate on theri profile and other places and also limit will be as per plan bought. 

––––––––––––––
Summary Flow Diagram

Pricing → 2. Plan Details & User Info → 3. Review & Payment → 4. Razorpay Checkout → 5. Confirmation → 6. plan update to current one which user just bought after confirmation and limit will be reset to upgraded plan.
```

## Project Context
- Frontend: React TypeScript application in WelthWestClientSharing
- Backend: Python Flask API in WelthWestServer2
- Goal: Implement complete save/fetch workflow for backtesting strategies and AI analysis results
- Dashboard should display saved data in organized sections
- Fixed market overview graph shaking issue
- Created comprehensive dashboard components with all API parameters