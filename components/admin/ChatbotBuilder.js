// components/admin/ChatbotBuilder.js
import { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node components
import QuestionNode from './flow-nodes/QuestionNode';
import OptionNode from './flow-nodes/OptionNode';

// Modal components
import Modal from './Modal';
import QuestionForm from './forms/QuestionForm';
import OptionForm from './forms/OptionForm';
import RecommendationForm from './forms/RecommendationForm';

const nodeTypes = {
  question: QuestionNode,
  option: OptionNode,
};

const ChatbotBuilder = () => {
  // Flow state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modal states
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  
  // Editor mode
  const [isEditing, setIsEditing] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch questions
        const questionsResponse = await fetch('/api/admin/questions');
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);
        
        // Fetch options
        const optionsResponse = await fetch('/api/admin/options');
        const optionsData = await optionsResponse.json();
        setOptions(optionsData);
        
        // Fetch courses for recommendations
        const coursesResponse = await fetch('/api/admin/courses');
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
        
        // Fetch recommendations
        const recommendationsResponse = await fetch('/api/admin/recommendations');
        const recommendationsData = await recommendationsResponse.json();
        setRecommendations(recommendationsData);
        
        // Convert data to flow nodes and edges
        convertDataToFlow(questionsData, optionsData, recommendationsData);
      } catch (error) {
        console.error('Error fetching chatbot flow data:', error);
        setMessage({ 
          type: 'error', 
          text: 'Akış verileri yüklenirken bir hata oluştu' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Convert database data to flow nodes and edges
  const convertDataToFlow = (questionsData, optionsData, recommendationsData) => {
    // Create nodes for questions
    const questionNodes = questionsData.map((question) => ({
      id: `question-${question.id}`,
      type: 'question',
      position: question.position || { x: question.orderNum * 250, y: 100 },
      data: { 
        label: question.text,
        id: question.id,
        orderNum: question.orderNum,
        onEdit: () => handleEditQuestion(question)
      },
    }));
    
    // Create nodes for options
    const optionNodes = optionsData.map((option) => ({
      id: `option-${option.id}`,
      type: 'option',
      position: option.position || { 
        x: questionNodes.find(q => q.data.id === option.questionId)?.position.x || 0,
        y: (questionNodes.find(q => q.data.id === option.questionId)?.position.y || 0) + 150
      },
      data: { 
        label: option.text,
        id: option.id,
        questionId: option.questionId,
        nextQuestionId: option.nextQuestionId,
        recommendations: recommendationsData.filter(r => r.optionId === option.id),
        onEdit: () => handleEditOption(option)
      },
    }));
    
    // Create edges connecting questions to options
    const questionToOptionEdges = optionsData.map((option) => ({
      id: `q${option.questionId}-o${option.id}`,
      source: `question-${option.questionId}`,
      target: `option-${option.id}`,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }));
    
    // Create edges connecting options to next questions
    const optionToQuestionEdges = optionsData
      .filter(option => option.nextQuestionId)
      .map((option) => ({
        id: `o${option.id}-q${option.nextQuestionId}`,
        source: `option-${option.id}`,
        target: `question-${option.nextQuestionId}`,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        animated: true,
      }));
    
    setNodes([...questionNodes, ...optionNodes]);
    setEdges([...questionToOptionEdges, ...optionToQuestionEdges]);
  };
  
  // Node change handlers
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  // CRUD operations for questions
  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setIsEditing(false);
    setShowQuestionModal(true);
  };
  
  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setIsEditing(true);
    setShowQuestionModal(true);
  };
  
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Bu soruyu silmek istediğinizden emin misiniz? Bu işlem bağlı tüm seçenekleri ve önerileri de silecektir.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/questions?id=${questionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Soru silinirken bir hata oluştu');
      }
      
      // Update local state
      setQuestions(questions.filter(q => q.id !== questionId));
      setOptions(options.filter(o => o.questionId !== questionId));
      setNodes(nodes.filter(node => node.id !== `question-${questionId}`));
      setEdges(edges.filter(edge => 
        !edge.source.includes(`question-${questionId}`) && 
        !edge.target.includes(`question-${questionId}`)
      ));
      
      setMessage({ type: 'success', text: 'Soru başarıyla silindi' });
    } catch (error) {
      console.error('Question delete error:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };
  
  const handleSaveQuestion = async (formData) => {
    try {
      setSaving(true);
      
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `/api/admin/questions?id=${selectedQuestion.id}` 
        : '/api/admin/questions';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Soru kaydedilirken bir hata oluştu');
      }
      
      const savedQuestion = await response.json();
      
      // Update local state
      if (isEditing) {
        setQuestions(questions.map(q => 
          q.id === savedQuestion.id ? savedQuestion : q
        ));
        setNodes(nodes.map(node => 
          node.id === `question-${savedQuestion.id}` 
            ? {
                ...node,
                data: { 
                  ...node.data, 
                  label: savedQuestion.text,
                  orderNum: savedQuestion.orderNum,
                }
              } 
            : node
        ));
      } else {
        setQuestions([...questions, savedQuestion]);
        
        // Add new node
        const newNode = {
          id: `question-${savedQuestion.id}`,
          type: 'question',
          position: { x: savedQuestion.orderNum * 250, y: 100 },
          data: { 
            label: savedQuestion.text,
            id: savedQuestion.id,
            orderNum: savedQuestion.orderNum,
            onEdit: () => handleEditQuestion(savedQuestion)
          },
        };
        
        setNodes([...nodes, newNode]);
      }
      
      setShowQuestionModal(false);
      setMessage({ 
        type: 'success', 
        text: `Soru başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}` 
      });
    } catch (error) {
      console.error('Question save error:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };
  
  // CRUD operations for options
  const handleAddOption = (questionId) => {
    setSelectedOption(null);
    setSelectedQuestion(questions.find(q => q.id === questionId));
    setIsEditing(false);
    setShowOptionModal(true);
  };
  
  const handleEditOption = (option) => {
    setSelectedOption(option);
    setIsEditing(true);
    setShowOptionModal(true);
  };
  
  const handleDeleteOption = async (optionId) => {
    if (!window.confirm('Bu seçeneği silmek istediğinizden emin misiniz? Bu işlem bağlı tüm önerileri de silecektir.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/options?id=${optionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Seçenek silinirken bir hata oluştu');
      }
      
      // Update local state
      setOptions(options.filter(o => o.id !== optionId));
      setRecommendations(recommendations.filter(r => r.optionId !== optionId));
      setNodes(nodes.filter(node => node.id !== `option-${optionId}`));
      setEdges(edges.filter(edge => 
        !edge.source.includes(`option-${optionId}`) && 
        !edge.target.includes(`option-${optionId}`)
      ));
      
      setMessage({ type: 'success', text: 'Seçenek başarıyla silindi' });
    } catch (error) {
      console.error('Option delete error:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };
  
  const handleSaveOption = async (formData) => {
    try {
      setSaving(true);
      
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `/api/admin/options?id=${selectedOption.id}` 
        : '/api/admin/options';
      
      // Prepare form data with questionId if adding new option
      const data = isEditing 
        ? formData 
        : { ...formData, questionId: selectedQuestion.id };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Seçenek kaydedilirken bir hata oluştu');
      }
      
      const savedOption = await response.json();
      
      // Update local state
      if (isEditing) {
        setOptions(options.map(o => 
          o.id === savedOption.id ? savedOption : o
        ));
        
        // Update node
        setNodes(nodes.map(node => 
          node.id === `option-${savedOption.id}` 
            ? {
                ...node,
                data: { 
                  ...node.data, 
                  label: savedOption.text,
                  nextQuestionId: savedOption.nextQuestionId,
                }
              } 
            : node
        ));
        
        // Update edges
        const existingEdge = edges.find(e => 
          e.source === `option-${savedOption.id}` && e.target.startsWith('question-')
        );
        
        if (existingEdge && savedOption.nextQuestionId) {
          // Update existing edge
          setEdges(edges.map(edge => 
            edge.id === existingEdge.id
              ? {
                  ...edge,
                  target: `question-${savedOption.nextQuestionId}`
                }
              : edge
          ));
        } else if (existingEdge && !savedOption.nextQuestionId) {
          // Remove edge if nextQuestionId is removed
          setEdges(edges.filter(edge => edge.id !== existingEdge.id));
        } else if (!existingEdge && savedOption.nextQuestionId) {
          // Add new edge
          const newEdge = {
            id: `o${savedOption.id}-q${savedOption.nextQuestionId}`,
            source: `option-${savedOption.id}`,
            target: `question-${savedOption.nextQuestionId}`,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            animated: true,
          };
          
          setEdges([...edges, newEdge]);
        }
      } else {
        setOptions([...options, savedOption]);
        
        // Find parent question node position
        const parentNode = nodes.find(node => node.id === `question-${selectedQuestion.id}`);
        const parentPosition = parentNode?.position || { x: 0, y: 0 };
        
        // Add new node
        const newNode = {
          id: `option-${savedOption.id}`,
          type: 'option',
          position: { 
            x: parentPosition.x + (options.filter(o => o.questionId === selectedQuestion.id).length * 150), 
            y: parentPosition.y + 150 
          },
          data: { 
            label: savedOption.text,
            id: savedOption.id,
            questionId: savedOption.questionId,
            nextQuestionId: savedOption.nextQuestionId,
            recommendations: [],
            onEdit: () => handleEditOption(savedOption)
          },
        };
        
        setNodes([...nodes, newNode]);
        
        // Add edge from question to option
        const questionToOptionEdge = {
          id: `q${savedOption.questionId}-o${savedOption.id}`,
          source: `question-${savedOption.questionId}`,
          target: `option-${savedOption.id}`,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        };
        
        let newEdges = [...edges, questionToOptionEdge];
        
        // Add edge from option to next question if specified
        if (savedOption.nextQuestionId) {
          const optionToQuestionEdge = {
            id: `o${savedOption.id}-q${savedOption.nextQuestionId}`,
            source: `option-${savedOption.id}`,
            target: `question-${savedOption.nextQuestionId}`,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            animated: true,
          };
          
          newEdges.push(optionToQuestionEdge);
        }
        
        setEdges(newEdges);
      }
      
      setShowOptionModal(false);
      setMessage({ 
        type: 'success', 
        text: `Seçenek başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}` 
      });
    } catch (error) {
      console.error('Option save error:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };
  
  // CRUD operations for recommendations
  const handleAddRecommendation = (optionId) => {
    setSelectedRecommendation(null);
    setSelectedOption(options.find(o => o.id === optionId));
    setIsEditing(false);
    setShowRecommendationModal(true);
  };
  
  const handleEditRecommendation = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsEditing(true);
    setShowRecommendationModal(true);
  };
  
  const handleDeleteRecommendation = async (recommendationId) => {
    if (!window.confirm('Bu öneriyi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/recommendations?id=${recommendationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Öneri silinirken bir hata oluştu');
      }
      
      // Update local state
      setRecommendations(recommendations.filter(r => r.id !== recommendationId));
      
      // Update option node data
      setNodes(nodes.map(node => {
        if (node.type === 'option') {
          return {
            ...node,
            data: {
              ...node.data,
              recommendations: node.data.recommendations?.filter(r => r.id !== recommendationId) || []
            }
          };
        }
        return node;
      }));
      
      setMessage({ type: 'success', text: 'Öneri başarıyla silindi' });
    } catch (error) {
      console.error('Recommendation delete error:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };
  
  const handleSaveRecommendation = async (formData) => {
    try {
      setSaving(true);
      
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `/api/admin/recommendations?id=${selectedRecommendation.id}` 
        : '/api/admin/recommendations';
      
      // Prepare form data with optionId if adding new recommendation
      const data = isEditing 
        ? formData 
        : { ...formData, optionId: selectedOption.id };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Öneri kaydedilirken bir hata oluştu');
      }
      
      const savedRecommendation = await response.json();
      
      // Update local state
      if (isEditing) {
        setRecommendations(recommendations.map(r => 
          r.id === savedRecommendation.id ? savedRecommendation : r
        ));
        
        // Update option node data
        setNodes(nodes.map(node => {
          if (node.type === 'option' && node.data.id === savedRecommendation.optionId) {
            return {
              ...node,
              data: {
                ...node.data,
                recommendations: node.data.recommendations.map(r => 
                  r.id === savedRecommendation.id ? savedRecommendation : r
                )
              }
            };
          }
          return node;
        }));
      } else {
        setRecommendations([...recommendations, savedRecommendation]);
        
        // Update option node data
        setNodes(nodes.map(node => {
          if (node.type === 'option' && node.data.id === selectedOption.id) {
            return {
              ...node,
              data: {
                ...node.data,
                recommendations: [...(node.data.recommendations || []), savedRecommendation]
              }
            };
          }
          return node;
        }));
      }
      
      setShowRecommendationModal(false);
      setMessage({ 
        type: 'success', 
        text: `Öneri başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}` 
      });
    } catch (error) {
      console.error('Recommendation save error:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };
  
  // Save node positions when diagram is modified
  const onNodeDragStop = async (event, node) => {
    try {
      // Extract node type and ID
      const [type, id] = node.id.split('-');
      
      // Save position to backend
      await fetch(`/api/admin/${type}s/position`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          position: node.position
        }),
      });
    } catch (error) {
      console.error('Failed to save node position:', error);
    }
  };
  
  // Export flow as JSON
  const handleExportFlow = () => {
    const flowData = {
      questions,
      options,
      recommendations,
      nodes: nodes.map(({ id, position }) => ({ id, position })),
    };
    
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-flow-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Import flow from JSON
  const handleImportFlow = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const flowData = JSON.parse(e.target.result);
        
        if (!window.confirm('Bu işlem mevcut akışın üzerine yazacaktır. Devam etmek istiyor musunuz?')) {
          return;
        }
        
        // Send to backend
        const response = await fetch('/api/admin/flow/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(flowData),
        });
        
        if (!response.ok) {
          throw new Error('Akış içe aktarılırken bir hata oluştu');
        }
        
        // Reload page to refresh data
        window.location.reload();
      } catch (error) {
        console.error('Flow import error:', error);
        setMessage({ type: 'error', text: 'Akış içe aktarılırken bir hata oluştu' });
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Message alert */}
      {message.text && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Chatbot Akış Tasarımı</h3>
        
        <div className="flex space-x-2">
          <button
            onClick={handleAddQuestion}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Soru Ekle
          </button>
          
          <button
            onClick={handleExportFlow}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Dışa Aktar
          </button>
          
          <label className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center cursor-pointer">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            İçe Aktar
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFlow}
            />
          </label>
        </div>
      </div>
      
      {/* Flow diagram */}
      <div className="h-[600px] w-full border border-gray-200 rounded">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      
      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Akış Diyagramı Lejantı</h4>
        <div className="flex space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Soru</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Seçenek</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-100 border border-purple-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Öneri</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-gray-400 mr-2"></div>
            <span className="text-sm text-gray-600">Bağlantı</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-0.5 border-b border-dashed border-gray-400 mr-2"></div>
            <span className="text-sm text-gray-600">Sonraki Soru Bağlantısı</span>
          </div>
        </div>
      </div>
      
      {/* Question modal */}
      {showQuestionModal && (
        <Modal
          title={isEditing ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
          onClose={() => setShowQuestionModal(false)}
        >
          <QuestionForm
            question={selectedQuestion}
            isEditing={isEditing}
            questions={questions}
            onSubmit={handleSaveQuestion}
            onCancel={() => setShowQuestionModal(false)}
            saving={saving}
          />
        </Modal>
      )}
      
      {/* Option modal */}
      {showOptionModal && (
        <Modal
          title={isEditing ? 'Seçeneği Düzenle' : 'Yeni Seçenek Ekle'}
          onClose={() => setShowOptionModal(false)}
        >
          <OptionForm
            option={selectedOption}
            questionId={selectedQuestion?.id}
            isEditing={isEditing}
            questions={questions}
            onSubmit={handleSaveOption}
            onCancel={() => setShowOptionModal(false)}
            saving={saving}
          />
        </Modal>
      )}
      
      {/* Recommendation modal */}
      {showRecommendationModal && (
        <Modal
          title={isEditing ? 'Öneriyi Düzenle' : 'Yeni Öneri Ekle'}
          onClose={() => setShowRecommendationModal(false)}
        >
          <RecommendationForm
            recommendation={selectedRecommendation}
            optionId={selectedOption?.id}
            isEditing={isEditing}
            courses={courses}
            onSubmit={handleSaveRecommendation}
            onCancel={() => setShowRecommendationModal(false)}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
};

export default ChatbotBuilder;