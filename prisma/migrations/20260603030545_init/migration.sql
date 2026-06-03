-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "cpf" TEXT,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plan" TEXT NOT NULL DEFAULT 'GRATUITO',
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "price" REAL NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "cnpj" TEXT,
    "cpf" TEXT,
    "themeColor" TEXT NOT NULL DEFAULT '#ff9607',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "minOrderValue" REAL NOT NULL DEFAULT 0,
    "deliveryTimeMin" INTEGER NOT NULL DEFAULT 30,
    "deliveryTimeMax" INTEGER NOT NULL DEFAULT 60,
    "acceptCash" BOOLEAN NOT NULL DEFAULT true,
    "acceptCard" BOOLEAN NOT NULL DEFAULT true,
    "acceptPix" BOOLEAN NOT NULL DEFAULT true,
    "pixKey" TEXT,
    "acceptOnlineCard" BOOLEAN NOT NULL DEFAULT false,
    "hasDelivery" BOOLEAN NOT NULL DEFAULT true,
    "hasPickup" BOOLEAN NOT NULL DEFAULT true,
    "hasDineIn" BOOLEAN NOT NULL DEFAULT false,
    "tableCount" INTEGER NOT NULL DEFAULT 0,
    "commandCount" INTEGER NOT NULL DEFAULT 0,
    "hasWaiters" BOOLEAN NOT NULL DEFAULT false,
    "serviceFee" REAL NOT NULL DEFAULT 0,
    "autoAcceptOrders" BOOLEAN NOT NULL DEFAULT false,
    "autoPrint" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" TEXT,
    "ifoodIntegrated" BOOLEAN NOT NULL DEFAULT false,
    "ifoodMerchantId" TEXT,
    "robotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "businessType" TEXT NOT NULL DEFAULT 'RESTAURANTE',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "business_hours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "storeId" TEXT NOT NULL,
    CONSTRAINT "business_hours_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "storeId" TEXT NOT NULL,
    CONSTRAINT "categories_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "price" REAL NOT NULL,
    "costPrice" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPromotion" BOOLEAN NOT NULL DEFAULT false,
    "promotionPrice" REAL,
    "stock" INTEGER NOT NULL DEFAULT 999,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "storeId" TEXT NOT NULL,
    "categoryId" TEXT,
    CONSTRAINT "products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_addons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    CONSTRAINT "product_addons_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "address" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "storeId" TEXT NOT NULL,
    CONSTRAINT "customers_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "type" TEXT NOT NULL DEFAULT 'DELIVERY',
    "paymentMethod" TEXT NOT NULL DEFAULT 'PIX',
    "changeFor" REAL,
    "subtotal" REAL NOT NULL,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "serviceFee" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "customerNote" TEXT,
    "internalNote" TEXT,
    "tableNumber" TEXT,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "note" TEXT,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_item_addons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "productAddonId" TEXT,
    CONSTRAINT "order_item_addons_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_item_addons_productAddonId_fkey" FOREIGN KEY ("productAddonId") REFERENCES "product_addons" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "delivery_zones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "radiusKm" REAL,
    "neighborhoods" TEXT,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "minOrderValue" REAL NOT NULL DEFAULT 0,
    "estimatedTimeMin" INTEGER NOT NULL DEFAULT 30,
    "estimatedTimeMax" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "storeId" TEXT NOT NULL,
    CONSTRAINT "delivery_zones_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "qrCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "storeId" TEXT NOT NULL,
    CONSTRAINT "tables_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "customers_storeId_phone_key" ON "customers"("storeId", "phone");
