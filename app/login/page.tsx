"use client"

import { KeyboardEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { validateUser, verifyOTP, submitUserDetails, autoLogin, submitNextAuthUserDetails, setAccessToken } from "@/utils/api"
import { otpVerification } from "@/utils/api"
import generateFingerprint from "@/utils/deviceId"
import UserDetail from "@/components/UserDetail"
import { getSession, signIn ,  signOut} from "next-auth/react" 
import { useMsal } from "@azure/msal-react"
import { loginRequest } from "@/msalConfig"



interface LoginDetail {
  username: string
  DeviceId?: string
  isTrusted?: null
}

interface GoogleMicrosoftOTPDetail {
    isOtpSent: boolean
    deviceId: string
    firstName: string
    lastName: string
    displayName: string
    email: string
    guser: string
    muser: string
    accessToken: string
    refreshToken: string
    scope: string
    caltype: number
  }

export default function Signin() {
  const [signInDetail, setSignInDetail] = useState<LoginDetail>({
    username: "",
    DeviceId: "",
    isTrusted: null,
  })
  const [isOTPSent, setIsOTPSent] = useState<boolean>(false)
  const [googleAndMicrosoftOTPDetail, setGoogleAndMicrosoftOTPDetail] = useState<GoogleMicrosoftOTPDetail | null>(null)
  const [otp, setOTP] = useState<string[]>(["", "", "", ""])
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isOtpVerified, setOtpVerified] = useState<boolean>(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const { instance, accounts } = useMsal() ; 

  const router = useRouter()

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSignInDetail((prevDetail) => ({
      ...prevDetail,
      [name]: value,
    }))
  }

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp]
    newOtp[index] = value

    if (value && index < 3) inputRefs.current[index + 1]?.focus()

    setOTP(newOtp)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && index > 0 && !otp[index]) {
      const newOtp = [...otp]
      newOtp[index - 1] = ""
      inputRefs.current[index - 1]?.focus()
      setOTP(newOtp)
    }
  }

  const handleSignIn = async () => {
    try {
      if (!signInDetail.username.trim()) {
        setLoading(false)
        setErrorMessage("Email cannot be empty")
        return
      }
      setLoading(true)

      const deviceId = localStorage.getItem("deviceId") || await generateFingerprint() ;
      console.log("Device ID from localStorage:", deviceId)

      const updatedSignInDetail = {
        ...signInDetail,
        DeviceId: deviceId
      }

      console.log("Updated sign-in details:", updatedSignInDetail)

      if (deviceId) {
        localStorage.setItem("deviceId", updatedSignInDetail.DeviceId) ; 
        const response = await autoLogin(updatedSignInDetail.username)

        if (response === "Auto login failed") {
          console.log("Reached login.tsx Auto Login Failed") ; 
          const codeRecieved = await validateUser(updatedSignInDetail)
          if (codeRecieved) {
            setIsOTPSent(true)
            setErrorMessage("")
          } else {
            console.error("Failed to validate user:")
          }
        } else {
          console.log(response)
          localStorage.setItem("email", updatedSignInDetail.username)
          localStorage.setItem("token", "Bearer " + response.code)
          router.push("/dashboard")
        }
      } else {
        const codeRecieved = await validateUser(signInDetail)
        if (codeRecieved) {
          setIsOTPSent(true)
          setErrorMessage("")
        } else {
          console.error("Failed to validate user:")
        }
      }
    } catch (error) {
      console.error("Error during user validation:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async () => {
    try {
      setLoading(true)

      let deviceId = localStorage.getItem("deviceId")
      console.log("Device ID from localStorage:", deviceId)
    
      if (!deviceId) {
        try {
            deviceId = await generateFingerprint() ; 
            localStorage.setItem("deviceId", deviceId) ; 
        }
        catch (error) {
            console.error("Failed to generate device ID:", error)
            setErrorMessage("Some Error Occured Please Try Again  later") ; 
            return ;
        }
      }
      console.log("Device ID from localStorage:", deviceId)
      const updatedSignInDetail = {
        ...signInDetail,
        DeviceId: deviceId || "",
      }

     const otpVerfication: otpVerification = await verifyOTP(updatedSignInDetail, otp.join(""))
     if (otpVerfication.isVerified) {
       console.log(otpVerfication)
       if (otpVerfication.isNewUser) {
         setOtpVerified(true)
         localStorage.setItem("email", signInDetail.username)
         localStorage.setItem("deviceId", deviceId)
       } else {
         router.push("/dashboard")
         localStorage.setItem("email", signInDetail.username)
         localStorage.setItem("deviceId", deviceId)
       }
     } else if (otpVerfication.failed) {
       setLoading(false)
       console.error("Failed to validate OTP:")
       setErrorMessage("Incorrect OTP")
     } else {
       setLoading(false)
       setErrorMessage("Something went wrong")
     }
    } catch (error) {
      console.error("Error during OTP validation:", error)
      setErrorMessage("Something went wrong")
    } finally {
      setLoading(false)
    }
  }


  const handleGoogleAndMicrosoftOTPSubmit = async () => {
    try {
        setLoading(true) ;

        const updatedSignInDetail = {
            username : googleAndMicrosoftOTPDetail!.email ,
            DeviceId : googleAndMicrosoftOTPDetail!.deviceId, 
            isTrusted : null , 
        }

        const otpVerfication = await verifyOTP(updatedSignInDetail, otp.join("")) ; 

        if (otpVerfication.isVerified) {

            const newUser = {
                firstName: googleAndMicrosoftOTPDetail?.firstName || "",
                lastName: googleAndMicrosoftOTPDetail?.lastName || "",
                displayName: googleAndMicrosoftOTPDetail?.displayName || "",
                email: googleAndMicrosoftOTPDetail?.email,
                deviceId: googleAndMicrosoftOTPDetail!.deviceId,
                guser: googleAndMicrosoftOTPDetail?.guser || "" ,
                muser: googleAndMicrosoftOTPDetail?.muser || "", 
              };
            const didSubmit = await submitNextAuthUserDetails(newUser) ; 
    
            if (didSubmit) {
                // Save the user token in local storage
                localStorage.setItem("token", "Bearer " + didSubmit);
                localStorage.setItem("email", googleAndMicrosoftOTPDetail!.email);
                localStorage.setItem("deviceId", googleAndMicrosoftOTPDetail!.deviceId);
        
                // Call setAccessToken API
                const accessToken = googleAndMicrosoftOTPDetail?.accessToken// Access token from Google or Microsoft
                const refreshToken = googleAndMicrosoftOTPDetail?.refreshToken; // Refresh token from Google or Microsoft
                  console.log(refreshToken);
                if (accessToken && refreshToken) {
                  try {
                      const caltype =  googleAndMicrosoftOTPDetail.caltype;
                      const scope = googleAndMicrosoftOTPDetail.scope;
                    const setTokenResponse = await setAccessToken(
                      `Bearer ${didSubmit}`,
                      accessToken,
                      googleAndMicrosoftOTPDetail!.email,
                      googleAndMicrosoftOTPDetail.displayName || "",
                      refreshToken,
                      scope,
                      caltype,
                    );
                    console.log("Set Access Token Response:", setTokenResponse);
                  } catch (error) {
                    console.error("Error saving access token:", error);
                    setErrorMessage("Failed to save access token");
                  }
                } else {
                  console.error("Missing access or refresh token");
                }
        
                // Redirect to dashboard
                setLoading(false);
                router.push("/dashboard");
            }
            
        } else if (otpVerfication.failed) {
            setLoading(false)
            console.error("Failed to validate OTP:")
            setErrorMessage("Incorrect OTP")
        } else {
            setLoading(false)
            setErrorMessage("Something went wrong")
        }
        } catch (error) {
           console.error("Error during OTP validation:", error)
           setErrorMessage("Something went wrong")
        } finally {
           setLoading(false)
        }
 }

  const handleUserDetailSubmit = async (userData: {
    firstName: string
    lastName: string
    displayName: string
    phoneNumber: string
  }) => {
    try {
      setLoading(true)
      const didSubmit = await submitUserDetails(userData, signInDetail)
      if (didSubmit) {
        setLoading(false)
        router.push("/dashboard")
      }
    } catch (error) {
      setLoading(false)
      console.error("Error during user detail submission:", error)
      setErrorMessage("Something went wrong")
    }
  }

  const handleMicrosoftSignIn = async () => {
    setLoading(true);
  
    try {
      // Step 1: Log in with Microsoft
      const loginResponse = await instance.loginPopup(loginRequest);
      const account = loginResponse.account;
  
      const accountAccessToken = await instance.acquireTokenSilent({
        scopes: ["User.Read", "Calendars.ReadWrite"],
        account,
      });
  
      const { accessToken } = accountAccessToken;
  
      // Step 2: Extract user profile information
      const userProfile = {
        firstName: account?.name?.split(" ")[0] || "",
        lastName: account?.name?.split(" ")[1] || "",
        displayName: account?.name || "",
        email: account?.username || "",
      };
  
      // Step 3: Generate or retrieve device ID
      const deviceId = localStorage.getItem("deviceId") || (await generateFingerprint());
      console.log("Device ID:", deviceId);
  
      // Step 4: Validate user and update OTP state
      const updatedSignInDetail = {
        username: userProfile.email,
        DeviceId: deviceId,
      };
  
      const codeReceived = await validateUser(updatedSignInDetail);
  
      if (codeReceived) {
        console.log("Code received:", codeReceived);
        setIsOTPSent(true);
        const details = {
          isOtpSent: true,
          deviceId: deviceId,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          displayName: userProfile.displayName,
          email: userProfile.email,
          guser: "",
          muser: JSON.stringify(userProfile),
          accessToken: accessToken,
          refreshToken: "", // Microsoft typically doesn’t return a refresh token directly in this scenario
          scope: "outlook",
          caltype: 2, // Assuming 2 is the type for Microsoft
        };
  
        setGoogleAndMicrosoftOTPDetail(details);
        console.log("Updated Microsoft OTP Details:", details);
  
        // Show OTP boxes

        setErrorMessage("");
      } else {
        console.error("Failed to validate user.");
        setErrorMessage("User validation failed.");
      }
    } catch (error) {
      console.error("Error during Microsoft Sign-In:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log("isOTPSent changed:", isOTPSent);
  }, [isOTPSent]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google"); // This will handle Google OAuth redirection
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
  };


  
  

  useEffect(() => {

    const handlePostSignIn = async () => {
      const session = await getSession();
      const user = session?.user;
      const token = localStorage.getItem('token')
  
      if (user?.email) {
          if(token){
              router.push("/dashboard"); 
              return ; 
          }
        const deviceId = localStorage.getItem("deviceId") || (await generateFingerprint());
  
        const isGoogle = session?.provider === "google";
        
        const newUser = {
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          displayName: user.name || "",
          email: user.email,
          deviceId: deviceId,
          guser: isGoogle ? JSON.stringify(user) : "", // Only set if it's Google
          muser: "", 
        };
    
        console.log("New User:", newUser);
    
        try {
          setLoading(true);
          
          const codeRecieved = await validateUser({
              username : user.email ,
              DeviceId : deviceId
          }) ; 
          
          if(codeRecieved){
              const details = {
                  isOtpSent: true,
                  deviceId: deviceId ,
                  firstName : newUser.firstName,
                  lastName : newUser.lastName,
                  displayName : newUser.displayName,
                  email : newUser.email,
                  guser : isGoogle? JSON.stringify(user) : "",
                  muser : "",
                  accessToken : session?.user.accessToken, 
                  refreshToken : session?.user.refreshToken,
                  scope : "google",
                  caltype :1 
              }
              setGoogleAndMicrosoftOTPDetail(details) ; 
              setIsOTPSent(true) ; 
  
              setLoading(false); 
          } 
        } catch (error) {
          setLoading(false);
          console.error("Error during user detail submission:", error);
          setErrorMessage("Something went wrong");
        }
      } else {
        console.error("Failed to retrieve user information");
      }
    };
    handlePostSignIn();
  }, []);


  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Choose your preferred sign-in method</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs for different sign-in methods */}
          {!isOTPSent ? (
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
                <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="m@example.com"
                      type="email"
                      name="username"
                      value={signInDetail.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
                  <Button className="w-full" onClick={handleSignIn} disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="google">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                  Google
                </Button>
              </TabsContent>
              <TabsContent value="microsoft">
                <Button variant="outline" className="w-full" onClick={handleMicrosoftSignIn}>
                  Microsoft
                </Button>
              </TabsContent>
            </Tabs>
          ) : (
            // OTP Inputs: Rendered Globally When isOTPSent is True
            <div className="space-y-4">
              <div className="flex justify-between space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    className="w-14 h-14 text-center"
                    type="text"
                    maxLength={1}
                    value={digit}
                    autoFocus={index === 0}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
              <Button
                className="w-full"
                onClick={googleAndMicrosoftOTPDetail?.isOtpSent ? handleGoogleAndMicrosoftOTPSubmit : handleOTPSubmit}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              {errorMessage && <p className="text-sm text-red-500 text-center">{errorMessage}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}  