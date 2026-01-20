import "server-only";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";


export async function POST(req: NextRequest) {
    const saltRounds = 12;
    try {
        const data = await req.json();
        const password = await bcrypt.hash(data.password, saltRounds);
        await prisma.user.create({ 
            data: {
                name: data.name,
                email: data.email,
                password,
            }
        });

        return NextResponse.json({ ok: true });
    }
    catch(error) {
        return NextResponse.json({ error: 'Error creating User' }, { status: 500 });
    }
       
}
