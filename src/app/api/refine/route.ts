import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { option, modification } = await request.json();

    if (!option || !modification) {
      console.error('Missing required fields in request body');
      return NextResponse.json(
        { 
          error: "Missing required fields", 
          details: "Both 'option' and 'modification' are required" 
        },
        { status: 400 }
      );
    }

    // For development, use a simple algorithm to refine the text
    // This ensures the frontend works even without API keys
    let refinedText = '';
    
    if (modification.includes('simpler') || modification.includes('simplify')) {
      // Simplify the text by shortening it and removing complex words
      const sentences = option.split(/[.!?]+/).filter(Boolean);
      if (sentences.length > 1) {
        refinedText = sentences[0] + '.';
      } else {
        // Just make it shorter
        refinedText = option.split(' ').slice(0, Math.max(5, Math.floor(option.split(' ').length * 0.7))).join(' ');
        if (!refinedText.endsWith('.')) refinedText += '.';
      }
    } else if (modification.includes('shorter')) {
      // Make it shorter
      refinedText = option.split(' ').slice(0, Math.max(5, Math.floor(option.split(' ').length * 0.6))).join(' ');
      if (!refinedText.endsWith('.')) refinedText += '.';
    } else if (modification.includes('funnier') || modification.includes('funny')) {
      // Add a funny element
      refinedText = option + " 😂";
    } else {
      // Default modification
      refinedText = option + " (" + modification + ")";
    }

    return NextResponse.json({ refined: refinedText });
    if (!process.env.GROK_API_KEY || !process.env.GROK_API_URL) {
      console.error('Missing environment variables: GROK_API_KEY or GROK_API_URL');
      return NextResponse.json(
        { 
          error: "Server configuration error", 
          details: "The server is missing required configuration. Please check environment variables."
        },
        { status: 500 }
      );
    }

    try {
      const grokResponse = await axios.post(
        process.env.GROK_API_URL + '/refine',
        {
          text: option,
          instruction: modification,
        },
        { 
          headers: { 
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!grokResponse.data.refined) {
        console.error('Invalid response format from Grok API:', grokResponse.data);
        return NextResponse.json(
          { 
            error: "Invalid API response format", 
            details: "The external API returned data in an unexpected format"
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ refined: grokResponse.data.refined });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Grok API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        return NextResponse.json(
          { 
            error: "Failed to refine text with external API",
            details: error.message,
            status: error.response?.status,
            data: JSON.stringify(error.response?.data || {})
          },
          { status: error.response?.status || 500 }
        );
      }
      
      throw error; // Re-throw if it's not an Axios error
    }
  } catch (error) {
    console.error('Refine API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: "An unexpected error occurred", 
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 