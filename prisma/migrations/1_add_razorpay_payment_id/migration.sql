-- Replay protection for online payments: each Razorpay payment can back at most one order.
ALTER TABLE "Order" ADD COLUMN "razorpayPaymentId" TEXT;
CREATE UNIQUE INDEX "Order_razorpayPaymentId_key" ON "Order"("razorpayPaymentId");
