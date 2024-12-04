// import { http, HttpResponse } from 'msw'

// const verificationCodes = new Map<string, string>()

// export const handlers = [
//   http.post("/api/auth/send-code", async ({ request }) => {
//     const { phoneNumber } = await request.json() as { phoneNumber: string }

//     if (!/^09[0-9]{9}$/.test(phoneNumber)) {
//       return HttpResponse.json(
//         { message: "شماره موبایل نامعتبر است" },
//         { status: 400 }
//       )
//     }

//     const randomCode = Math.floor(10000 + Math.random() * 90000).toString()
    
//     verificationCodes.set(phoneNumber, randomCode)

//     return HttpResponse.json(
//       { message: "کد تایید ارسال شد", code: randomCode },
//       { status: 200 }
//     )
//   }),

//   http.post("/api/auth/verify-code", async ({ request }) => {
//     const { code, phoneNumber } = await request.json() as { 
//       code: string,
//       phoneNumber: string 
//     }

//     const storedCode = verificationCodes.get(phoneNumber)

//     if (!storedCode) {
//       return HttpResponse.json(
//         { message: "کد تایید منقضی شده است" },
//         { status: 401 }
//       )
//     }

//     if (code !== storedCode) {
//       return HttpResponse.json(
//         { message: "کد تایید نادرست است" },
//         { status: 401 }
//       )
//     }

//     verificationCodes.delete(phoneNumber)

//     return HttpResponse.json(
//       { message: "ورود موفقیت‌آمیز بود" },
//       { status: 200 }
//     )
//   }),
  
//   http.post("/api/auth/logout", async () => {
//     return HttpResponse.json(
//       { message: "خروج با موفقیت انجام شد" },
//       { status: 200 }
//     );
//   }),
// ]


import { rest } from 'msw'

const verificationCodes = new Map<string, string>()

export const handlers = [
  rest.post("/api/auth/send-code", async (req, res, ctx) => {
    const { phoneNumber } = await req.json<{ phoneNumber: string }>()
  
    if (!/^09[0-9]{9}$/.test(phoneNumber)) {
      return res(
        ctx.status(400),
        ctx.json({ message: "شماره موبایل نامعتبر است" })
      )
    }
  
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
    verificationCodes.set(phoneNumber, randomCode)
  
    return res(
      ctx.status(200),
      ctx.json({ message: "کد تایید ارسال شد", code: randomCode })
    )
  }),
  

  rest.post("/api/auth/verify-code", async (req, res, ctx) => {
    const { code, phoneNumber } = await req.json<{ code: string, phoneNumber: string }>()

    const storedCode = verificationCodes.get(phoneNumber)

    if (!storedCode) {
      return res(
        ctx.status(401),
        ctx.json({ message: "کد تایید منقضی شده است" })
      )
    }

    if (code !== storedCode) {
      return res(
        ctx.status(401),
        ctx.json({ message: "کد تایید نادرست است" })
      )
    }

    verificationCodes.delete(phoneNumber)

    return res(
      ctx.status(200),
      ctx.json({ message: "ورود موفقیت‌آمیز بود" })
    )
  }),

  rest.post("/api/auth/logout", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: "خروج با موفقیت انجام شد" })
    )
  }),
]
