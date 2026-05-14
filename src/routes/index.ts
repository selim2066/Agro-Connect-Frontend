import { Router } from 'express';

// ─────────────────────────────────────────────────────────────────────────────
// Root API router — mounts all feature modules at /api/v1
// Module routers are imported and registered here as they are implemented.
// ─────────────────────────────────────────────────────────────────────────────

export const apiRouter = Router();

// Placeholder — remove when first module is implemented
apiRouter.get('/', (_req, res) => {
  res.json({ success: true, message: 'AgroConnect API v1' });
});

// ── Module routes (uncomment as each module is built) ─────────────────────
// import { authRouter } from '../modules/auth/auth.routes';
// import { userRouter } from '../modules/user/user.routes';
// import { sellerRouter } from '../modules/seller/seller.routes';
// import { categoryRouter } from '../modules/category/category.routes';
// import { productRouter } from '../modules/product/product.routes';
// import { shopRouter } from '../modules/shop/shop.routes';
// import { orderRouter } from '../modules/order/order.routes';
// import { paymentRouter } from '../modules/payment/payment.routes';
// import { creditRouter } from '../modules/credit/credit.routes';
// import { subscriptionRouter } from '../modules/subscription/subscription.routes';
// import { connectionRouter } from '../modules/connection/connection.routes';
// import { reviewRouter } from '../modules/review/review.routes';
// import { aiRouter } from '../modules/ai/ai.routes';
// import { uploadRouter } from '../modules/upload/upload.routes';
// import { notificationRouter } from '../modules/notification/notification.routes';
// import { blogRouter } from '../modules/blog/blog.routes';
// import { newsletterRouter } from '../modules/newsletter/newsletter.routes';
// import { adminRouter } from '../modules/admin/admin.routes';

// apiRouter.use('/auth', authRouter);
// apiRouter.use('/users', userRouter);
// apiRouter.use('/sellers', sellerRouter);
// apiRouter.use('/categories', categoryRouter);
// apiRouter.use('/products', productRouter);
// apiRouter.use('/shops', shopRouter);
// apiRouter.use('/orders', orderRouter);
// apiRouter.use('/payments', paymentRouter);
// apiRouter.use('/credits', creditRouter);
// apiRouter.use('/subscriptions', subscriptionRouter);
// apiRouter.use('/connections', connectionRouter);
// apiRouter.use('/reviews', reviewRouter);
// apiRouter.use('/ai', aiRouter);
// apiRouter.use('/upload', uploadRouter);
// apiRouter.use('/notifications', notificationRouter);
// apiRouter.use('/blogs', blogRouter);
// apiRouter.use('/newsletter', newsletterRouter);
// apiRouter.use('/admin', adminRouter);
