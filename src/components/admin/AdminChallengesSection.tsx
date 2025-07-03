import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  useAdminChallenges, 
  useCreateChallenge, 
  useUpdateChallenge, 
  useDeleteChallenge,
  usePendingSubmissions,
  useReviewSubmission,
  ProductChallenge,
  CreateChallengeData 
} from '@/hooks/useChallenges';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Target, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminChallengesSection = () => {
  const { data: challenges = [], isLoading: challengesLoading } = useAdminChallenges();
  const { data: pendingSubmissions = [], isLoading: submissionsLoading } = usePendingSubmissions();
  const { products } = useAdminProducts();
  const createChallenge = useCreateChallenge();
  const updateChallenge = useUpdateChallenge();
  const deleteChallenge = useDeleteChallenge();
  const reviewSubmission = useReviewSubmission();

  const [selectedChallenge, setSelectedChallenge] = useState<ProductChallenge | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const [challengeForm, setChallengeForm] = useState<CreateChallengeData>({
    product_id: '',
    title: '',
    description: '',
    task_instructions: '',
    diary_prompt: '',
    emoji: '🏆',
    points_reward: 50,
    time_limit_hours: 48,
    completion_time_minutes: undefined,
    difficulty_level: 'easy'
  });

  const [reviewForm, setReviewForm] = useState({
    approval_status: 'approved' as 'approved' | 'rejected' | 'needs_revision',
    admin_feedback: '',
    auto_post_to_diary: false
  });

  const resetForm = () => {
    setChallengeForm({
      product_id: '',
      title: '',
      description: '',
      task_instructions: '',
      diary_prompt: '',
      emoji: '🏆',
      points_reward: 50,
      time_limit_hours: 48,
      completion_time_minutes: undefined,
      difficulty_level: 'easy'
    });
  };

  const handleCreateChallenge = async () => {
    try {
      await createChallenge.mutateAsync(challengeForm);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating challenge:', error);
    }
  };

  const handleUpdateChallenge = async () => {
    if (!selectedChallenge) return;
    
    try {
      await updateChallenge.mutateAsync({
        id: selectedChallenge.id,
        ...challengeForm
      });
      setIsEditModalOpen(false);
      setSelectedChallenge(null);
      resetForm();
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await deleteChallenge.mutateAsync(challengeId);
      } catch (error) {
        console.error('Error deleting challenge:', error);
      }
    }
  };

  const handleReviewSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      await reviewSubmission.mutateAsync({
        submissionId: selectedSubmission.id,
        approvalStatus: reviewForm.approval_status,
        adminFeedback: reviewForm.admin_feedback || undefined,
        autoPostToDiary: reviewForm.auto_post_to_diary
      });
      setReviewModalOpen(false);
      setSelectedSubmission(null);
      setReviewForm({
        approval_status: 'approved',
        admin_feedback: '',
        auto_post_to_diary: false
      });
    } catch (error) {
      console.error('Error reviewing submission:', error);
    }
  };

  const openEditModal = (challenge: ProductChallenge) => {
    setSelectedChallenge(challenge);
    setChallengeForm({
      product_id: challenge.product_id,
      title: challenge.title,
      description: challenge.description,
      task_instructions: challenge.task_instructions,
      diary_prompt: challenge.diary_prompt || '',
      emoji: challenge.emoji,
      points_reward: challenge.points_reward,
      time_limit_hours: challenge.time_limit_hours,
      completion_time_minutes: challenge.completion_time_minutes,
      difficulty_level: challenge.difficulty_level
    });
    setIsEditModalOpen(true);
  };

  const openReviewModal = (submission: any) => {
    setSelectedSubmission(submission);
    setReviewForm({
      approval_status: 'approved',
      admin_feedback: '',
      auto_post_to_diary: false
    });
    setReviewModalOpen(true);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (challengesLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Challenge Management</h2>
          <p className="text-gray-600">Create and manage product challenges for gamification</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <ChallengeForm
              form={challengeForm}
              setForm={setChallengeForm}
              products={products}
              onSubmit={handleCreateChallenge}
              onCancel={() => setIsCreateModalOpen(false)}
              isLoading={createChallenge.isPending}
              submitText="Create Challenge"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{challenges.length}</p>
                <p className="text-sm text-gray-600">Total Challenges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{challenges.filter(c => c.is_active).length}</p>
                <p className="text-sm text-gray-600">Active Challenges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{pendingSubmissions.length}</p>
                <p className="text-sm text-gray-600">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(challenges.map(c => c.product_id)).size}
                </p>
                <p className="text-sm text-gray-600">Products with Challenges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Submissions Section */}
      {pendingSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Pending Challenge Submissions ({pendingSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingSubmissions.map((submission: any) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {submission.user_challenge_instances.product_challenges.emoji}
                        </span>
                        <h4 className="font-medium">
                          {submission.user_challenge_instances.product_challenges.title}
                        </h4>
                        <Badge variant="outline">
                          {submission.user_challenge_instances.profiles?.name || 'User'}
                        </Badge>
                      </div>
                      
                      {submission.user_notes && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>User Notes:</strong> {submission.user_notes}
                        </p>
                      )}
                      
                      {submission.completion_time_minutes && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Completion Time:</strong> {submission.completion_time_minutes} minutes
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Submitted {format(new Date(submission.created_at), 'MMM dd, yyyy \'at\' h:mm a')}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReviewModal(submission)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenges List */}
      <Card>
        <CardHeader>
          <CardTitle>All Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{challenge.emoji}</span>
                      <h4 className="font-medium">{challenge.title}</h4>
                      <Badge className={getDifficultyColor(challenge.difficulty_level)}>
                        {challenge.difficulty_level}
                      </Badge>
                      <Badge variant={challenge.is_active ? 'default' : 'secondary'}>
                        {challenge.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        <span>{challenge.points_reward} points</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{challenge.time_limit_hours}h limit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>{challenge.products?.title}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(challenge)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteChallenge(challenge.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Challenge Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
          </DialogHeader>
          <ChallengeForm
            form={challengeForm}
            setForm={setChallengeForm}
            products={products}
            onSubmit={handleUpdateChallenge}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateChallenge.isPending}
            submitText="Update Challenge"
          />
        </DialogContent>
      </Dialog>

      {/* Review Submission Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Challenge Submission</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">
                  {selectedSubmission.user_challenge_instances.product_challenges.title}
                </h4>
                <p className="text-sm text-gray-600">
                  By: {selectedSubmission.user_challenge_instances.profiles?.name || 'User'}
                </p>
                {selectedSubmission.user_notes && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Notes:</strong> {selectedSubmission.user_notes}
                  </p>
                )}
                {selectedSubmission.completion_time_minutes && (
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {selectedSubmission.completion_time_minutes} minutes
                  </p>
                )}
              </div>

              {/* Uploaded Images Section */}
              {selectedSubmission.image_urls && selectedSubmission.image_urls.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Uploaded Images ({selectedSubmission.image_urls.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSubmission.image_urls.map((imageUrl: string, index: number) => (
                      <div 
                        key={index} 
                        className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        onClick={() => window.open(imageUrl, '_blank')}
                      >
                        <img 
                          src={imageUrl} 
                          alt={`Challenge submission ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Review Decision</Label>
                <Select 
                  value={reviewForm.approval_status} 
                  onValueChange={(value: any) => setReviewForm(prev => ({ ...prev, approval_status: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Approve
                      </div>
                    </SelectItem>
                    <SelectItem value="needs_revision">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        Needs Revision
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Reject
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="adminFeedback">Admin Feedback</Label>
                <Textarea
                  id="adminFeedback"
                  placeholder="Provide feedback to the user..."
                  value={reviewForm.admin_feedback}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, admin_feedback: e.target.value }))}
                  className="mt-2"
                />
              </div>

              {reviewForm.approval_status === 'approved' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoDiary"
                    checked={reviewForm.auto_post_to_diary}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, auto_post_to_diary: e.target.checked }))}
                  />
                  <Label htmlFor="autoDiary">Auto-post to community diary</Label>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleReviewSubmission}
                  disabled={reviewSubmission.isPending}
                  className="flex-1"
                >
                  {reviewSubmission.isPending ? 'Reviewing...' : 'Submit Review'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setReviewModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Challenge Form Component
interface ChallengeFormProps {
  form: CreateChallengeData;
  setForm: React.Dispatch<React.SetStateAction<CreateChallengeData>>;
  products: any[];
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  submitText: string;
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({
  form,
  setForm,
  products,
  onSubmit,
  onCancel,
  isLoading,
  submitText
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="product">Product</Label>
        <Select value={form.product_id} onValueChange={(value) => setForm(prev => ({ ...prev, product_id: value }))}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Challenge Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Speed Builder Challenge"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="emoji">Emoji</Label>
          <Input
            id="emoji"
            value={form.emoji}
            onChange={(e) => setForm(prev => ({ ...prev, emoji: e.target.value }))}
            placeholder="🏆"
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Complete your puzzle as fast as possible!"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="instructions">Task Instructions</Label>
        <Textarea
          id="instructions"
          value={form.task_instructions}
          onChange={(e) => setForm(prev => ({ ...prev, task_instructions: e.target.value }))}
          placeholder="Detailed instructions on how to complete the challenge..."
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="diaryPrompt">Diary Prompt (Optional)</Label>
        <Textarea
          id="diaryPrompt"
          value={form.diary_prompt}
          onChange={(e) => setForm(prev => ({ ...prev, diary_prompt: e.target.value }))}
          placeholder="Upload a picture and share your experience..."
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={form.difficulty_level} onValueChange={(value: any) => setForm(prev => ({ ...prev, difficulty_level: value }))}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="points">Points Reward</Label>
          <Input
            id="points"
            type="number"
            value={form.points_reward}
            onChange={(e) => setForm(prev => ({ ...prev, points_reward: parseInt(e.target.value) || 0 }))}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeLimit">Time Limit (hours)</Label>
          <Input
            id="timeLimit"
            type="number"
            value={form.time_limit_hours}
            onChange={(e) => setForm(prev => ({ ...prev, time_limit_hours: parseInt(e.target.value) || 0 }))}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="targetTime">Target Time (minutes) - Optional</Label>
          <Input
            id="targetTime"
            type="number"
            value={form.completion_time_minutes || ''}
            onChange={(e) => setForm(prev => ({ ...prev, completion_time_minutes: e.target.value ? parseInt(e.target.value) : undefined }))}
            placeholder="10"
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          onClick={onSubmit}
          disabled={isLoading || !form.product_id || !form.title || !form.description || !form.task_instructions}
          className="flex-1 bg-orange-500 hover:bg-orange-600"
        >
          {isLoading ? 'Saving...' : submitText}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AdminChallengesSection; 