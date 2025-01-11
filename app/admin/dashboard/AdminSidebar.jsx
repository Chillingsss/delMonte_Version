"use client";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BookOpen, Brain, Briefcase, Building, CircleUser, FileCheck, FileCheck2, FileText, GraduationCap, Home, Lightbulb, LogOut, Menu, Settings, Settings2, Users, ChevronDown, Clipboard, ListCheck, Layers } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { PopoverClose } from '@radix-ui/react-popover';

function AdminSidebar({ changeView, changeMasterFile }) {
  const [view, setView] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const sideTabs = [
    { name: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Jobs", icon: <Briefcase className="h-5 w-5" /> },
    { name: "Master Files", icon: <FileText className="h-5 w-5" /> }
  ]

  const masterFiles = [
    { name: "Course category", icon: <BookOpen className="h-5 w-5" />, index: 2 },
    { name: "Course", icon: <GraduationCap className="h-5 w-5" />, index: 3 },
    { name: "Institution", icon: <Building className="h-5 w-5" />, index: 4 },
    { name: "Knowledge and Compliance", icon: <Brain className="h-5 w-5" />, index: 5 },
    { name: "License master", icon: <FileCheck className="h-5 w-5" />, index: 6 },
    { name: "License type", icon: <FileCheck2 className="h-5 w-5" />, index: 7 },
    { name: "Skills", icon: <Lightbulb className="h-5 w-5" />, index: 8 },
    { name: "Trainings", icon: <Users className="h-5 w-5" />, index: 9 },
    { name: "Interview Category", icon: <Layers className="h-5 w-5" />, index: 10 },
    { name: "Interview Criteria", icon: <ListCheck className="h-5 w-5" />, index: 11 },
    { name: "General Exam", icon: <Clipboard className="h-5 w-5" />, index: 12 },
  ]
  const handleChangeView = (index) => {
    changeView(index);
    setView(index);
    setIsOpen(false);
    console.log("index: ", index);
  }

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  }
  
  return (
    <>
      <header className="sm:hidden w-full sticky top-0 flex h-16 items-center gap-4 border-b bg-[#0e4028] px-4 md:px-6 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="shrink-0 md:hidden bg-[#0e5a35] text-white"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div
              href="#"
              className="flex items-center gap-2 text-lg font-semibold mb-10"
            >
              <Image src="/assets/images/delmonteLogo.png" alt="DelmonteLogo" width={152} height={152} className="w-32 h-24 transition-all group-hover:scale-110" />
              <span className="sr-only">Delmonte</span>
            </div>

            <nav className="grid gap-6 text-lg font-medium">
              {sideTabs.map((tab, index) => (
                index !== 2 ? (
                  <div
                    key={index}
                    href="#"
                    className={`flex p-3 items-center gap-2 cursor-pointer text-lg font-semibold md:text-base rounded-md ${index === view ? 'bg-accent text-primary transition-all duration-450 ease-in-out' : 'text-tertiary'}`}
                    onClick={() => handleChangeView(index)}
                  >
                    {tab.icon}
                    {tab.name}
                    <span className="sr-only">{tab.name}</span>
                  </div>
                ) : (
                  <DropdownMenu key={index}>
                    <DropdownMenuTrigger className="flex p-3 items-center gap-2 cursor-pointer text-lg font-semibold md:text-base rounded-md">
                      {tab.icon}
                      {tab.name}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {masterFiles.map((file, fileIndex) => (
                        <DropdownMenuItem key={fileIndex} onClick={() => handleChangeView(file.index)}>
                          {file.icon}
                          <span className="ml-2">{file.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full bg-[#0e5a35] text-white">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings2 className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-[#0e5a35] dark:bg-[#0e4028] sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {/* logo  */}
          <div
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full  text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Image src="/assets/images/delmonteLogo.png" alt="DelmonteLogo" width={32} height={32} className="transition-all group-hover:scale-110" />
            <span className="sr-only">Del Monte</span>
          </div>
          <TooltipProvider>
            {sideTabs.map((tab, index) => (
              index !== 2 ? (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
                      href="#"
                      className={`flex h-9 w-9  ${view === index ? "bg-primary text-black hover:text-white transition-all duration-500 ease-in-out" : "bg-transparent transition-colors text-white hover:text-black"} items-center justify-center rounded-lg hover:bg-primary transition-colors md:h-8 md:w-8 cursor-pointer`}
                      onClick={() => handleChangeView(index)}
                    >
                      {tab.icon}
                      <span className="sr-only">{tab.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">{tab.name}</TooltipContent>
                </Tooltip>
              ) : (
                <Popover key={index}>
                  <PopoverTrigger asChild>
                    <div
                      className={`flex h-9 w-9 ${view >= 2 && view <= 9 ? "bg-primary text-black hover:text-white transition-all duration-500 ease-in-out" : "bg-transparent transition-colors text-white hover:text-black"} items-center justify-center rounded-lg hover:bg-primary transition-colors md:h-8 md:w-8 cursor-pointer`}
                    >
                      {tab.icon}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] md:w-[500px] lg:w-[600px]">
                    <div className="flex flex-col gap-2 ml-4">
                      <h1 className="text-xl font-semibold">Master Files</h1>
                      <Separator className="w-full" />
                      <div className="grid gap-3 md:grid-cols-2">
                        {masterFiles.map((file, fileIndex) => (
                          <div key={fileIndex} className="group">
                            <PopoverClose asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors group-hover:bg-accent group-hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="#"
                                onClick={() => handleChangeView(file.index)}
                              >
                                <div className="flex items-center">
                                  {file.icon}
                                  <div className="ml-2 text-sm font-medium leading-none">{file.name}</div>
                                </div>
                              </a>
                            </PopoverClose>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )
            ))}
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center "
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" className="bg-transparent rounded-lg text-white transition-colors hover:text-black md:h-8 md:w-8">
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings2 className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
    </>
  )
}

export default AdminSidebar