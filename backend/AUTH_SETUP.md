# Authentication & Live Classes Setup

## Authentication

### Backend Endpoints
- `POST /api/v1/auth/register` - Register new user (teacher or student)
- `POST /api/v1/auth/login` - Login with email and password

Both return JWT token and user data.

### Frontend Flow
1. **Login/Register Page** (`/login`)
   - Users can toggle between Login and Register tabs
   - Register: Enter full name, username, email, password, and select role (teacher/student)
   - Login: Enter email and password
   - On success, user is redirected to dashboard

2. **Protected Routes**
   - All app routes are protected - redirects to `/login` if not authenticated
   - Token stored in localStorage for persistence

3. **Logout**
   - Available in Profile page
   - Clears token and redirects to login

## Accessing Live Classes (WebRTC)

### How It Works

1. **Teacher Starts a Class**
   - Teacher creates a class session via API or dashboard
   - When class starts, it gets a `webrtc_room_id`
   - Class status changes to `live`

2. **Students See Live Classes**
   - Go to **Classes tab**
   - See "Current Classes" section
   - Live classes show a red status dot
   - Click "Join Live Class" button on any live class

3. **Joining a Class**
   - Navigates to `/live/{classId}` route
   - Automatically connects to WebRTC signalling server: `ws://localhost:8000/ws/rtc/{classId}`
   - Local camera/mic preview starts
   - Chat panel connects to class chat room

### WebRTC Signalling

**Backend Endpoint:**
```
WS /ws/rtc/{class_id}
```

- Relays SDP offers/answers between teacher and students
- Handles ICE candidate exchange
- Teacher's video stream can be broadcasted to all students
- Students can interact via chat

### Current Implementation

- ✅ WebRTC signalling WebSocket connection
- ✅ Local media capture (camera/mic)
- ✅ Toggle camera/mic controls
- ✅ Chat integration in live class
- ⚠️ Full peer-to-peer video streaming (requires RTCPeerConnection setup - can be added)

## Demo Credentials

After seeding database:

**Student:**
- Email: `harshit@shotes.com`
- Password: `pass`

**Teachers:**
- Email: `jennifer.winget@shotes.com` / `elizabeth@shotes.com` / `suresh.mishra@shotes.com`
- Password: `pass`

## Next Steps for Full WebRTC

To complete video streaming:
1. Implement RTCPeerConnection in Live.tsx
2. Handle SDP offer/answer exchange via WebSocket
3. Exchange ICE candidates
4. Set remote stream to display teacher's video
5. For multiple students, use SFU (Selective Forwarding Unit) or mesh network

