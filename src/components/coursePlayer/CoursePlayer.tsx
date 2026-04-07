import React, { useState, useEffect } from 'react';
import { 
  Play, 
  FileText, 
  HelpCircle, 
  FileQuestion, 
  Lock, 
  CheckCircle, 
  Circle,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowLeft,
  Menu,
  X,
  Clock,
  BookOpen,
  MessageSquare,
  Download,
  Check,
  ListOrdered,
} from 'lucide-react';
import { Disclosure, Transition } from '@headlessui/react';
import { cn } from '../../utils/cn';
import type { Course, Module, Lesson, CoursePlayerState, ContentType, LessonStatus } from '../../types/coursePlayer';

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  video: <Play className="w-4 h-4" />,
  reading: <FileText className="w-4 h-4" />,
  quiz: <HelpCircle className="w-4 h-4" />,
  assignment: <FileQuestion className="w-4 h-4" />,
};

const contentTypeColors: Record<ContentType, string> = {
  video: 'bg-red-100 text-red-600',
  reading: 'bg-blue-100 text-blue-600',
  quiz: 'bg-purple-100 text-purple-600',
  assignment: 'bg-amber-100 text-amber-600',
};

const statusIcons: Record<LessonStatus, React.ReactNode> = {
  locked: <Lock className="w-4 h-4 text-gray-400" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  in_progress: <Circle className="w-4 h-4 text-indigo-500" />,
  not_started: <Circle className="w-4 h-4 text-gray-300" />,
};

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  onLessonSelect: (lessonId: string) => void;
  onMarkComplete: (lessonId: string) => void;
  initialLessonId?: string;
}

export function CoursePlayer({ 
  course, 
  onBack, 
  onLessonSelect, 
  onMarkComplete,
  initialLessonId 
}: CoursePlayerProps) {
  const [state, setState] = useState<CoursePlayerState>({
    currentModuleId: course.modules[0]?.id || null,
    currentLessonId: initialLessonId || course.modules[0]?.lessons[0]?.id || null,
    sidebarOpen: true,
    activeTab: 'overview',
  });

  const [scrolled, setScrolled] = useState(false);

  const currentModule = course.modules.find(m => m.id === state.currentModuleId);
  const currentLesson = currentModule?.lessons.find(l => l.id === state.currentLessonId);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLessonClick = (moduleId: string, lesson: Lesson) => {
    if (lesson.isLocked) return;
    setState(prev => ({
      ...prev,
      currentModuleId: moduleId,
      currentLessonId: lesson.id,
    }));
    onLessonSelect(lesson.id);
  };

  const handleModuleToggle = (moduleId: string) => {
    setState(prev => ({
      ...prev,
      currentModuleId: prev.currentModuleId === moduleId ? prev.currentModuleId : moduleId,
    }));
  };

  const getProgressPercentage = (module: Module) => {
    const completed = module.lessons.filter(l => l.status === 'completed').length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <header 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-shadow duration-200',
          scrolled && 'shadow-md'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Back to Dashboard</span>
            </button>
            <div className="hidden md:block h-6 w-px bg-gray-300" />
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs lg:max-w-md">
              {course.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search course..."
                className="pl-9 pr-4 py-2 w-64 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button 
              onClick={() => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {state.sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </header>

      <div className="flex flex-1 pt-[73px]">
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {currentLesson ? (
            <>
              {/* Video/Content Area */}
              <div className="bg-black aspect-video relative">
                {currentLesson.contentType === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-gray-400">Video Player Placeholder</p>
                      <p className="text-sm text-gray-500 mt-1">{currentLesson.videoUrl || 'No video URL'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-white p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto prose prose-indigo">
                      <h2>{currentLesson.title}</h2>
                      <p>{currentLesson.content || 'Reading content placeholder...'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Info & Mark Complete */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{currentLesson.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className={cn('inline-flex items-center gap-1', contentTypeColors[currentLesson.contentType])}>
                        {contentTypeIcons[currentLesson.contentType]}
                        {currentLesson.contentType.charAt(0).toUpperCase() + currentLesson.contentType.slice(1)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentLesson.estimatedMinutes} min
                      </span>
                    </div>
                  </div>
                  {currentLesson.status !== 'completed' && !currentLesson.isLocked && (
                    <button
                      onClick={() => onMarkComplete(currentLesson.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      <Check className="w-5 h-5" />
                      Mark as Complete
                    </button>
                  )}
                  {currentLesson.status === 'completed' && (
                    <span className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Tab System */}
              <div className="bg-white">
                <div className="max-w-5xl mx-auto">
                  <TabNav 
                    activeTab={state.activeTab}
                    onTabChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}
                  />
                  
                  <div className="px-6 py-6 border-t border-gray-100">
                    <TabContent activeTab={state.activeTab} lesson={currentLesson} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-gray-500">Select a lesson to begin</p>
            </div>
          )}
        </main>

        {/* Sidebar - Course Content */}
        <aside 
          className={cn(
            'w-80 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto transition-all duration-300',
            'fixed lg:relative inset-y-0 right-0 z-40 pt-[73px]',
            state.sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0'
          )}
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
            
            {course.modules.map((module) => (
              <ModuleAccordion
                key={module.id}
                module={module}
                isExpanded={state.currentModuleId === module.id}
                onToggle={() => handleModuleToggle(module.id)}
                currentLessonId={state.currentLessonId}
                onLessonClick={(lesson) => handleLessonClick(module.id, lesson)}
              />
            ))}
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Sheet Overlay */}
      {state.sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setState(prev => ({ ...prev, sidebarOpen: false }))}
        />
      )}
    </div>
  );
}

interface ModuleAccordionProps {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  currentLessonId: string | null;
  onLessonClick: (lesson: Lesson) => void;
}

function ModuleAccordion({ module, isExpanded, onToggle, currentLessonId, onLessonClick }: ModuleAccordionProps) {
  const progress = Math.round((module.lessons.filter(l => l.status === 'completed').length / module.lessons.length) * 100);

  return (
    <Disclosure defaultOpen={isExpanded}>
      {({ open }) => (
        <div className="mb-2">
          <Disclosure.Button 
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onToggle}
          >
            <div className="flex items-center gap-3 text-left">
              <ChevronRight 
                className={cn(
                  'w-5 h-5 text-gray-400 transition-transform',
                  open && 'rotate-90'
                )} 
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">{module.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {module.lessons.length} lessons • {progress}% complete
                </p>
              </div>
            </div>
          </Disclosure.Button>
          
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="pl-11 pr-2 pb-2">
              {module.lessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  isActive={lesson.id === currentLessonId}
                  onClick={() => onLessonClick(lesson)}
                />
              ))}
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
}

interface LessonItemProps {
  lesson: Lesson;
  isActive: boolean;
  onClick: () => void;
}

function LessonItem({ lesson, isActive, onClick }: LessonItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={lesson.isLocked}
      className={cn(
        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors mb-1',
        isActive && 'bg-indigo-50',
        !isActive && !lesson.isLocked && 'hover:bg-gray-50',
        lesson.isLocked && 'opacity-50 cursor-not-allowed'
      )}
    >
      {statusIcons[lesson.status]}
      <span className={cn(
        'flex-1 text-sm truncate',
        isActive && 'font-medium text-indigo-700',
        !isActive && 'text-gray-700'
      )}>
        {lesson.title}
      </span>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className={cn('text-xs px-1.5 py-0.5 rounded', contentTypeColors[lesson.contentType])}>
          {contentTypeIcons[lesson.contentType]}
        </span>
        <span className="text-xs text-gray-400">{lesson.estimatedMinutes}m</span>
      </div>
    </button>
  );
}

interface TabNavProps {
  activeTab: CoursePlayerState['activeTab'];
  onTabChange: (tab: CoursePlayerState['activeTab']) => void;
}

function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BookOpen },
    { id: 'notes' as const, label: 'Notes', icon: ListOrdered },
    { id: 'discussion' as const, label: 'Discussion', icon: MessageSquare },
    { id: 'resources' as const, label: 'Resources', icon: Download },
  ];

  return (
    <div className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

interface TabContentProps {
  activeTab: CoursePlayerState['activeTab'];
  lesson: Lesson;
}

function TabContent({ activeTab, lesson }: TabContentProps) {
  switch (activeTab) {
    case 'overview':
      return (
        <div className="prose prose-sm max-w-none">
          <h3>About this lesson</h3>
          <p>
            This {lesson.contentType} will take approximately {lesson.estimatedMinutes} minutes to complete.
            {lesson.contentType === 'video' && ' Watch the video carefully and take notes on key concepts.'}
            {lesson.contentType === 'reading' && ' Read through the material thoroughly and review any highlighted sections.'}
            {lesson.contentType === 'quiz' && ' Test your understanding by completing the quiz at the end.'}
          </p>
          <h4>Learning Objectives</h4>
          <ul>
            <li>Understand key concepts covered in this lesson</li>
            <li>Apply knowledge to real-world scenarios</li>
            <li>Prepare for related assessments</li>
          </ul>
        </div>
      );
    
    case 'notes':
      return (
        <div>
          <textarea
            placeholder="Take notes here..."
            className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              Save Notes
            </button>
          </div>
        </div>
      );
    
    case 'discussion':
      return (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No discussions yet. Start a conversation below.</p>
          <div className="mt-4 flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Ask a question or share your thoughts..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
              Post
            </button>
          </div>
        </div>
      );
    
    case 'resources':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <Download className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Lesson Slides</p>
              <p className="text-xs text-gray-500">PDF • 2.4 MB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <Download className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Supplementary Reading</p>
              <p className="text-xs text-gray-500">PDF • 1.1 MB</p>
            </div>
          </div>
        </div>
      );
    
    default:
      return null;
  }
}

export default CoursePlayer;