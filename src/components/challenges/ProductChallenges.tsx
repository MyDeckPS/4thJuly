import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserProductChallenges, useStartChallenge, useSubmitChallenge, UserChallengeInstance } from '@/hooks/useChallenges';
import { 
  Trophy, 
  Timer, 
  Target, 
  Camera, 
  CheckCircle, 
  Play,
  Clock,
  Upload,
  AlertCircle,
  X,
  ImagePlus
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProductChallengesProps {
  userProductPurchaseId: string;
  productTitle: string;
}

const ProductChallenges: React.FC<ProductChallengesProps> = ({ 
  userProductPurchaseId, 
  productTitle 
}) => {
  const { user } = useAuth();
  const { data: challenges = [], isLoading } = useUserProductChallenges(userProductPurchaseId);
  const startChallenge = useStartChallenge();
  const submitChallenge = useSubmitChallenge();
  
  const [selectedChallenge, setSelectedChallenge] = useState<UserChallengeInstance | null>(null);
  const [submissionData, setSubmissionData] = useState({
    userNotes: '',
    completionTimeMinutes: '',
    imageUrls: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-orange-100 text-orange-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Target className="w-4 h-4" />;
      case 'active': return <Timer className="w-4 h-4" />;
      case 'submitted': return <Upload className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    if (selectedFiles.length + newFiles.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    // Update selected files
    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreviews(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartChallenge = async (challengeId: string) => {
    try {
      await startChallenge.mutateAsync(challengeId);
    } catch (error) {
      console.error('Error starting challenge:', error);
    }
  };

  const handleSubmitChallenge = async () => {
    if (!selectedChallenge || !user) return;
    
    setIsSubmitting(true);
    setUploading(true);
    
    try {
      let imageUrls: string[] = [];
      
      // Upload images if any are selected
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('challenge_images')
            .upload(fileName, file);
          
          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('challenge_images')
            .getPublicUrl(fileName);
          
          imageUrls.push(publicUrl);
        }
      }
      
      await submitChallenge.mutateAsync({
        challengeInstanceId: selectedChallenge.id,
        userNotes: submissionData.userNotes || undefined,
        completionTimeMinutes: submissionData.completionTimeMinutes ? 
          parseInt(submissionData.completionTimeMinutes) : undefined,
        imageUrls: imageUrls
      });
      
      // Reset form
      setSubmissionData({
        userNotes: '',
        completionTimeMinutes: '',
        imageUrls: []
      });
      setSelectedFiles([]);
      setImagePreviews([]);
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Error submitting challenge:', error);
      toast.error('Failed to submit challenge');
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const getRemainingTime = (challenge: UserChallengeInstance) => {
    if (!challenge.expires_at) return null;
    const expiresAt = new Date(challenge.expires_at);
    const now = new Date();
    
    if (expiresAt <= now) return 'Expired';
    return formatDistanceToNow(expiresAt, { addSuffix: true });
  };

  const resetForm = () => {
    setSubmissionData({
      userNotes: '',
      completionTimeMinutes: '',
      imageUrls: []
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setSelectedChallenge(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No challenges available for this product yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-orange-500" />
        <h4 className="font-medium text-gray-900">Unlocked Challenges</h4>
        <Badge variant="outline" className="text-xs">
          {challenges.filter(c => c.status === 'completed').length}/{challenges.length} completed
        </Badge>
      </div>

      {challenges.map((challenge) => (
        <Card key={challenge.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{challenge.product_challenges.emoji}</span>
                  <h5 className="font-medium text-gray-900">
                    {challenge.product_challenges.title}
                  </h5>
                  <Badge className={getDifficultyColor(challenge.product_challenges.difficulty_level)}>
                    {challenge.product_challenges.difficulty_level}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {challenge.product_challenges.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>{challenge.product_challenges.points_reward} points</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{challenge.product_challenges.time_limit_hours}h limit</span>
                  </div>
                  {challenge.product_challenges.completion_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>Target: {challenge.product_challenges.completion_time_minutes}min</span>
                    </div>
                  )}
                </div>

                {challenge.status === 'active' && challenge.expires_at && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-orange-700">
                      <Timer className="w-4 h-4" />
                      <span>Time remaining: {getRemainingTime(challenge)}</span>
                    </div>
                  </div>
                )}

                {challenge.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        Completed on {format(new Date(challenge.completed_at!), 'MMM dd, yyyy')} • 
                        {challenge.points_earned} points earned
                      </span>
                    </div>
                  </div>
                )}

                {challenge.challenge_submissions && challenge.challenge_submissions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                    <div className="text-sm text-blue-700">
                      <strong>Status:</strong> {challenge.challenge_submissions[0].approval_status}
                      {challenge.challenge_submissions[0].admin_feedback && (
                        <div className="mt-1">
                          <strong>Admin feedback:</strong> {challenge.challenge_submissions[0].admin_feedback}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(challenge.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(challenge.status)}
                    <span className="capitalize">{challenge.status}</span>
                  </div>
                </Badge>

                {challenge.status === 'available' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleStartChallenge(challenge.id)}
                    disabled={startChallenge.isPending}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Challenge
                  </Button>
                )}

                {challenge.status === 'active' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedChallenge(challenge)}
                        className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      >
                        <Camera className="w-4 h-4 mr-1" />
                        Submit Completion
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span>{challenge.product_challenges.emoji}</span>
                          Submit Challenge: {challenge.product_challenges.title}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Task Instructions:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {challenge.product_challenges.task_instructions}
                          </p>
                        </div>

                        {challenge.product_challenges.diary_prompt && (
                          <div>
                            <Label htmlFor="userNotes">
                              📔 Diary Prompt: {challenge.product_challenges.diary_prompt}
                            </Label>
                            <Textarea
                              id="userNotes"
                              placeholder="Share your experience..."
                              value={submissionData.userNotes}
                              onChange={(e) => setSubmissionData(prev => ({ 
                                ...prev, 
                                userNotes: e.target.value 
                              }))}
                              className="mt-2"
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor="completionTime">Completion Time (minutes)</Label>
                          <Input
                            id="completionTime"
                            type="number"
                            placeholder="How long did it take?"
                            value={submissionData.completionTimeMinutes}
                            onChange={(e) => setSubmissionData(prev => ({ 
                              ...prev, 
                              completionTimeMinutes: e.target.value 
                            }))}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Upload Photos (Optional - Max 3)</Label>
                          <div className="mt-2 space-y-3">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                              id="challenge-image-upload"
                              disabled={selectedFiles.length >= 3}
                            />
                            
                            {selectedFiles.length < 3 && (
                              <label
                                htmlFor="challenge-image-upload"
                                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors"
                              >
                                <ImagePlus className="w-5 h-5 text-orange-500" />
                                <span className="text-sm text-orange-600">Add Images</span>
                              </label>
                            )}
                            
                            {imagePreviews.length > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                {imagePreviews.map((preview, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-20 object-cover rounded-lg border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500">
                              Supported formats: JPEG, PNG, WebP. Max 10MB per image.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button 
                            onClick={handleSubmitChallenge}
                            disabled={isSubmitting || uploading}
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                          >
                            {uploading ? 'Uploading Images...' : isSubmitting ? 'Submitting...' : 'Submit Challenge'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={resetForm}
                            disabled={isSubmitting || uploading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductChallenges; 