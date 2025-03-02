"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { TestConfig, User } from "@/types"

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [test, setTest] = useState<TestConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);

    if (parsedUser.role !== "student") {
      router.push("/login");
      return;
    }
    
    const storedTests = localStorage.getItem('tests');
    if (storedTests) {
      const tests: TestConfig[] = JSON.parse(storedTests);
      const availableTest = tests.find(test => test.assignedTo.includes(parsedUser.id));
      if (availableTest) {
        setTest(availableTest);
      }
    }
    
    setLoading(false);
  }, [router]);
  
  const startTest = (testId: string) => {
    router.push(`/student/test/${testId}`);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours ${minutes} minutes`;
  };
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>;
  }
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sstudize</h1>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-white border-white hover:bg-blue-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-black">Available Test</h2>
          {test ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-md mx-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-black">{test.title}</h3>
                <p className="text-black mb-4">{test.description || 'No description provided'}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-black">Subjects:</span>
                    <span className="font-medium text-black">{test.subjects.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Questions:</span>
                    <span className="font-medium text-black">{test.questionIds.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Duration:</span>
                    <span className="font-medium text-black">{formatTime(test.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Scheduled For:</span>
                    <span className="font-medium text-black">{new Date(test.scheduledFor).toLocaleString()}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => startTest(test.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                >
                  Start Test
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md mx-auto">
              <p className="text-black">No test available at the moment</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

