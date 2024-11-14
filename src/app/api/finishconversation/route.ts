import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { currentUser, auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
//  const { userId, redirectToSignIn } = await auth()

  try {
    
    //if (!userId) {
      //return NextResponse.json(
        //{ error: 'Unauthorized - Please sign in' },
        //{ status: 401 }
      //);
    //}

    //const user = await currentUser()

    // Get the conversation text from request body
    const { conversationText } = await request.json();

    if (!conversationText || typeof conversationText !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request - conversationText is required and must be a string' },
        { status: 400 }
      );
    }

    // STEP 1
    // Send the conversation text to the user via email
    // Return a success response


    // STEP 2
    // Summarize the conversation using OpenAI or similar API


    // GOAL
    // Summarize the conversation using OpenAI or similar API
    // Send the summary to the user via email
    // Return a success response
    
    const resend = new Resend('re_aunuqzuV_HdbSNJB4LDG8JZ1EX5RBNNcb');
    
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    // Add ordinal suffix (st, nd, rd, th)
    const dateString = formatter.format(date).replace(/(\d+)/, (match) => {
      const day = parseInt(match);
      // Special case for 11th, 12th, 13th
      if (day >= 11 && day <= 13) {
        return `${day}th`;
      }
      const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 ? 0 : day % 10)];
      return `${day}${suffix}`;
    });


    // Summarize conversationText

    resend.emails.send({
      from: 'onboarding@resend.dev',
      //to: `${user?.emailAddresses[0].emailAddress}`,
      to: 'henrik.berggren@gmail.com',
      subject: `Summary of your conversation, ${dateString}`,
      html: conversationText
    });


    return NextResponse.json(
      { 
        success: true,
        message: 'Conversation finished successfully',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in finishConversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 