import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://Vercel-Admin-support-applocation:OqTExNvBbS2PZQVl@support-applocation.3tzo10r.mongodb.net/?retryWrites=true&w=majority"
const DB_NAME = "wishlist"
const COLLECTION_NAME = "orders"
const NOTIFICATION_EMAIL = "timofeyevim@gmail.com"

let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  cachedClient = client
  return client
}

// GET all orders
export async function GET() {
  try {
    const client = await connectToDatabase()
    const db = client.db(DB_NAME)
    const orders = await db.collection(COLLECTION_NAME).find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, comment } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 })
    }

    const client = await connectToDatabase()
    const db = client.db(DB_NAME)

    const newOrder = {
      items,
      comment: comment || "",
      status: "ordered",
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection(COLLECTION_NAME).insertOne(newOrder)
    const orderId = result.insertedId.toString()

    const orderUrl = `${request.nextUrl.origin}/orders/${orderId}`

    try {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #FFE5F1 0%, #FFB3D9 100%);
      padding: 20px;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(255, 105, 180, 0.3);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #FF69B4;
      font-size: 32px;
      margin: 10px 0;
    }
    .emoji {
      font-size: 48px;
      display: block;
      margin-bottom: 10px;
    }
    .content {
      color: #333;
      line-height: 1.6;
    }
    .items-list {
      background: #FFF0F8;
      border-left: 4px solid #FF69B4;
      padding: 20px;
      margin: 20px 0;
      border-radius: 10px;
    }
    .items-list h3 {
      color: #FF1493;
      margin-top: 0;
    }
    .item {
      padding: 10px 0;
      border-bottom: 1px dashed #FFB3D9;
      display: flex;
      align-items: center;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-number {
      background: #FF69B4;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      font-weight: bold;
    }
    .comment {
      background: #FFF5FA;
      padding: 15px;
      border-radius: 10px;
      margin: 20px 0;
      font-style: italic;
      color: #666;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #FF69B4, #FF1493);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4);
    }
    .button:hover {
      background: linear-gradient(135deg, #FF1493, #FF69B4);
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #FFE5F1;
    }
    .date {
      color: #999;
      font-size: 14px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="emoji">🎀</span>
      <h1>Новый заказ вкусняшек!</h1>
      <span class="emoji">🍰✨</span>
    </div>
    
    <div class="content">
      <p>Привет! У тебя новый заказ от твоей любимой девушки! 💕</p>
      
      <div class="items-list">
        <h3>📝 Список желаний:</h3>
        ${items
          .map(
              (item: string, index: number) => `
          <div class="item">
            <span class="item-number">${index + 1}</span>
            <span>${item}</span>
          </div>
        `,
          )
          .join("")}
      </div>
      
      ${
          comment
              ? `
        <div class="comment">
          <strong>💬 Комментарий:</strong><br>
          ${comment}
        </div>
      `
              : ""
      }
      
      <p class="date">🕐 Дата заказа: ${new Date().toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}</p>
      
      <div style="text-align: center;">
        <a href="${orderUrl}" class="button">
          👀 Посмотреть полный заказ
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #FF69B4; text-align: center;">
        Не забудь порадовать свою девушку! 💖
      </p>
    </div>
    
    <div class="footer">
      <p>Wishlist App · Made with 💕</p>
    </div>
  </div>
</body>
</html>
      `

      await fetch("https://api.tagmate.ru/api/settings/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: NOTIFICATION_EMAIL,
          title: `🎀 Новый заказ вкусняшек!`,
          html: emailHtml,
        }),
      })
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      // Continue even if email fails
    }

    return NextResponse.json({ _id: orderId, ...newOrder }, { status: 201 })
  } catch (error) {
    console.error("Failed to create order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
