
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import QuizQuestionManager from "./QuizQuestionManager";
import QuizSetsManager from "./QuizSetsManager";
import TaggingRulesManager from "./TaggingRulesManager";
import QuizQuestionDialog from "./QuizQuestionDialog";
import QuizSetDialog from "./QuizSetDialog";
import TaggingRuleDialog from "./TaggingRuleDialog";
import DebugConsole from "./DebugConsole";

const AdminQuizSection = () => {
  const [activeTab, setActiveTab] = useState("sets");
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showSetDialog, setShowSetDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingSet, setEditingSet] = useState(null);
  const [editingRule, setEditingRule] = useState(null);

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setShowQuestionDialog(true);
  };

  const handleEditSet = (set: any) => {
    setEditingSet(set);
    setShowSetDialog(true);
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setShowRuleDialog(true);
  };

  const handleCloseQuestionDialog = () => {
    setShowQuestionDialog(false);
    setEditingQuestion(null);
  };

  const handleCloseSetDialog = () => {
    setShowSetDialog(false);
    setEditingSet(null);
  };

  const handleCloseRuleDialog = () => {
    setShowRuleDialog(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-forest">Quiz Management</CardTitle>
              <p className="text-muted-foreground mt-1">
                Manage quiz sets, questions and tagging rules for personalized recommendations
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger 
                value="sets" 
                className="data-[state=active]:bg-warm-sage data-[state=active]:text-white"
              >
                Quiz Sets
              </TabsTrigger>
              <TabsTrigger 
                value="questions" 
                className="data-[state=active]:bg-warm-sage data-[state=active]:text-white"
              >
                Questions
              </TabsTrigger>
              <TabsTrigger 
                value="tagging" 
                className="data-[state=active]:bg-warm-sage data-[state=active]:text-white"
              >
                Tagging Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sets" className="space-y-4">
              <div className="flex justify-between items-center bg-gradient-to-r from-warm-sage/10 to-forest/10 p-4 rounded-lg border border-warm-sage/20">
                <div>
                  <h3 className="text-lg font-semibold text-forest">Quiz Sets</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize questions into logical groups with titles and descriptions
                  </p>
                </div>
                <Button 
                  onClick={() => setShowSetDialog(true)}
                  className="bg-warm-sage hover:bg-forest transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Set
                </Button>
              </div>
              <QuizSetsManager onEdit={handleEditSet} />
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <div className="flex justify-between items-center bg-gradient-to-r from-warm-sage/10 to-forest/10 p-4 rounded-lg border border-warm-sage/20">
                <div>
                  <h3 className="text-lg font-semibold text-forest">Quiz Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and manage questions for the enhanced quiz experience
                  </p>
                </div>
                <Button 
                  onClick={() => setShowQuestionDialog(true)}
                  className="bg-warm-sage hover:bg-forest transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
              <QuizQuestionManager onEdit={handleEditQuestion} />
            </TabsContent>

            <TabsContent value="tagging" className="space-y-4">
              <div className="flex justify-between items-center bg-gradient-to-r from-warm-sage/10 to-forest/10 p-4 rounded-lg border border-warm-sage/20">
                <div>
                  <h3 className="text-lg font-semibold text-forest">Tagging Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Define how quiz responses map to user tags and traits
                  </p>
                </div>
                <Button 
                  onClick={() => setShowRuleDialog(true)}
                  className="bg-warm-sage hover:bg-forest transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
              <TaggingRulesManager onEdit={handleEditRule} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Debug Console */}
      <DebugConsole 
        module="QuizManagement" 
        className="mt-6"
      />

      {/* Dialogs */}
      <QuizSetDialog
        open={showSetDialog}
        onOpenChange={setShowSetDialog}
        quizSet={editingSet}
        onClose={handleCloseSetDialog}
      />

      <QuizQuestionDialog
        open={showQuestionDialog}
        onOpenChange={setShowQuestionDialog}
        question={editingQuestion}
        onClose={handleCloseQuestionDialog}
      />

      <TaggingRuleDialog
        open={showRuleDialog}
        onOpenChange={setShowRuleDialog}
        rule={editingRule}
        onClose={handleCloseRuleDialog}
      />
    </div>
  );
};

export default AdminQuizSection;
