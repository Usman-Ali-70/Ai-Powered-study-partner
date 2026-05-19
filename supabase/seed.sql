-- ================================================
-- StudyMind AI — Seed Data
-- Run AFTER schema.sql and AFTER signing up a test user
--
-- IMPORTANT: Replace 'YOUR_USER_ID' below with
-- your actual Supabase auth user UUID.
-- You can find it in Supabase Dashboard > Authentication > Users
-- ================================================

-- Set your test user ID here:
DO $$
DECLARE
  test_user_id UUID;
  note1_id UUID;
  note2_id UUID;
  note3_id UUID;
  quiz1_id UUID;
  deck1_id UUID;
  deck2_id UUID;
BEGIN

  -- Grab the first user in auth.users (your test account)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first, then run this seed.';
  END IF;

  RAISE NOTICE 'Seeding data for user: %', test_user_id;

  -- ========== NOTES ==========

  INSERT INTO notes (id, user_id, title, content, summary, source_type, subject, word_count, created_at)
  VALUES (
    gen_random_uuid(), test_user_id,
    'Introduction to Machine Learning',
    'Machine Learning (ML) is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. ML focuses on the development of computer programs that can access data and use it to learn for themselves.

The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide. The primary aim is to allow computers to learn automatically without human intervention.

Types of Machine Learning:
1. Supervised Learning - The algorithm learns from labeled training data. Examples include classification and regression.
2. Unsupervised Learning - The algorithm learns from unlabeled data. Examples include clustering and dimensionality reduction.
3. Reinforcement Learning - The algorithm learns by interacting with an environment and receiving rewards or penalties.

Key Algorithms:
- Linear Regression: Used for predicting continuous values
- Decision Trees: Used for classification and regression
- Neural Networks: Inspired by biological neural networks
- Support Vector Machines: Used for classification tasks
- K-Means Clustering: Used for grouping similar data points

Applications of ML:
- Image and speech recognition
- Medical diagnosis
- Stock market prediction
- Recommendation systems (Netflix, Spotify)
- Self-driving cars
- Natural language processing

Important Concepts:
- Overfitting: When a model learns the training data too well, including noise
- Underfitting: When a model is too simple to capture the underlying patterns
- Bias-Variance Tradeoff: Finding the right balance between model complexity and generalization
- Cross-Validation: A technique for evaluating model performance
- Feature Engineering: The process of selecting and transforming variables for better model performance',
    'This note covers the fundamentals of Machine Learning, including its three main types (supervised, unsupervised, reinforcement learning), key algorithms (linear regression, decision trees, neural networks, SVMs, K-Means), real-world applications, and important concepts like overfitting, underfitting, and the bias-variance tradeoff.',
    'manual', 'Computer Science', 347, now() - interval '3 days'
  ) RETURNING id INTO note1_id;

  INSERT INTO notes (id, user_id, title, content, summary, source_type, subject, word_count, created_at)
  VALUES (
    gen_random_uuid(), test_user_id,
    'Data Structures & Algorithms',
    'Data Structures are ways of organizing and storing data so that they can be accessed and worked with efficiently. They define the relationship between the data elements and the operations that can be performed on them.

Fundamental Data Structures:

1. Arrays
- Fixed-size collection of elements of the same type
- O(1) access time, O(n) insertion/deletion
- Contiguous memory allocation

2. Linked Lists
- Dynamic collection where each element points to the next
- O(n) access, O(1) insertion/deletion at known position
- Non-contiguous memory

3. Stacks (LIFO - Last In First Out)
- Push and Pop operations
- Used in: function call stack, undo operations, expression evaluation

4. Queues (FIFO - First In First Out)
- Enqueue and Dequeue operations
- Used in: BFS, task scheduling, print queue

5. Trees
- Hierarchical data structure with root and children
- Binary Search Tree: Left < Root < Right
- AVL Trees: Self-balancing BST
- Time complexity: O(log n) for balanced trees

6. Hash Tables
- Key-value pairs with hash function
- Average O(1) lookup, insertion, deletion
- Collision handling: chaining, open addressing

7. Graphs
- Vertices connected by edges
- Directed vs Undirected
- BFS and DFS traversal algorithms
- Applications: social networks, GPS, web crawling

Algorithm Complexity:
- Big O Notation: Upper bound of time/space complexity
- Common complexities: O(1), O(log n), O(n), O(n log n), O(n²), O(2^n)

Sorting Algorithms:
- Bubble Sort: O(n²) - simple but slow
- Merge Sort: O(n log n) - divide and conquer
- Quick Sort: O(n log n) average - in-place, widely used
- Heap Sort: O(n log n) - uses heap data structure',
    'Comprehensive overview of fundamental data structures (arrays, linked lists, stacks, queues, trees, hash tables, graphs) with their time complexities, and essential sorting algorithms with Big O notation analysis.',
    'manual', 'Computer Science', 280, now() - interval '1 day'
  ) RETURNING id INTO note2_id;

  INSERT INTO notes (id, user_id, title, content, summary, source_type, subject, word_count, created_at)
  VALUES (
    gen_random_uuid(), test_user_id,
    'Psychology 101 - Memory & Learning',
    'Memory is the faculty of the brain by which data or information is encoded, stored, and retrieved when needed.

Types of Memory:
1. Sensory Memory - Very brief (0.5-3 seconds), captures sensory information
   - Iconic memory (visual)
   - Echoic memory (auditory)

2. Short-Term Memory (Working Memory)
   - Duration: 15-30 seconds without rehearsal
   - Capacity: 7 ± 2 items (Miller''s Law)
   - Can be extended through chunking

3. Long-Term Memory
   - Explicit (Declarative): Facts and events
     - Episodic: Personal experiences
     - Semantic: General knowledge
   - Implicit (Non-declarative): Skills and habits
     - Procedural: How to do things

Encoding Strategies:
- Elaborative rehearsal: Making meaningful connections
- Mnemonics: Memory aids (acronyms, method of loci)
- Spaced repetition: Reviewing at increasing intervals
- Dual coding: Using both verbal and visual information

Forgetting:
- Ebbinghaus Forgetting Curve: We forget ~50% within an hour, ~70% within 24 hours
- Interference Theory: Old and new information compete
  - Proactive: Old interferes with new
  - Retroactive: New interferes with old
- Decay Theory: Memories fade over time without use

Learning Theories:
- Classical Conditioning (Pavlov): Learning through association
- Operant Conditioning (Skinner): Learning through consequences
- Social Learning (Bandura): Learning through observation
- Cognitive Learning: Learning through understanding and reasoning

Study Techniques Backed by Research:
1. Active Recall: Testing yourself instead of re-reading
2. Spaced Repetition: The SM-2 algorithm optimizes review intervals
3. Interleaving: Mixing different topics during study sessions
4. Elaboration: Explaining concepts in your own words
5. Concrete Examples: Connecting abstract ideas to real situations',
    'Covers types of memory (sensory, short-term, long-term), encoding strategies, the forgetting curve, learning theories (classical/operant conditioning, social learning), and evidence-based study techniques like active recall, spaced repetition, and interleaving.',
    'manual', 'Psychology', 310, now() - interval '5 hours'
  ) RETURNING id INTO note3_id;

  -- ========== QUIZZES ==========

  INSERT INTO quizzes (id, user_id, note_id, title, subject, difficulty, questions, score, total_questions, completed_at, created_at)
  VALUES (
    gen_random_uuid(), test_user_id, note1_id,
    'Machine Learning Fundamentals Quiz',
    'Computer Science', 'medium',
    '[
      {"id":"q1","type":"mcq","question":"Which type of ML learns from labeled data?","options":["Supervised Learning","Unsupervised Learning","Reinforcement Learning","Semi-supervised Learning"],"correct":"Supervised Learning","explanation":"Supervised learning uses labeled training data where both input and expected output are provided.","topic":"ML Types","difficulty":"easy"},
      {"id":"q2","type":"true_false","question":"Neural networks are inspired by biological neural networks.","correct":"True","explanation":"Neural networks are computational models inspired by the way biological neurons process information.","topic":"Algorithms","difficulty":"easy"},
      {"id":"q3","type":"mcq","question":"What is overfitting?","options":["Model too simple","Model learns noise in training data","Model has high bias","Model generalizes well"],"correct":"Model learns noise in training data","explanation":"Overfitting occurs when a model learns the training data too well, including its noise and fluctuations.","topic":"Key Concepts","difficulty":"medium"},
      {"id":"q4","type":"mcq","question":"Which algorithm is used for grouping similar data points?","options":["Linear Regression","K-Means Clustering","Decision Trees","SVM"],"correct":"K-Means Clustering","explanation":"K-Means is an unsupervised learning algorithm used for clustering similar data points together.","topic":"Algorithms","difficulty":"medium"},
      {"id":"q5","type":"short_answer","question":"Name one application of Machine Learning in healthcare.","correct":"Medical diagnosis","explanation":"ML is used in medical diagnosis to detect diseases from imaging, predict patient outcomes, and assist in drug discovery.","topic":"Applications","difficulty":"easy"}
    ]',
    4, 5, now() - interval '2 hours', now() - interval '2 days'
  ) RETURNING id INTO quiz1_id;

  INSERT INTO quizzes (user_id, note_id, title, subject, difficulty, questions, total_questions, created_at)
  VALUES (
    test_user_id, note2_id,
    'Data Structures Pop Quiz',
    'Computer Science', 'hard',
    '[
      {"id":"q1","type":"mcq","question":"What is the time complexity of accessing an element in an array by index?","options":["O(1)","O(n)","O(log n)","O(n²)"],"correct":"O(1)","explanation":"Arrays provide constant-time access by index since elements are stored in contiguous memory.","topic":"Arrays","difficulty":"easy"},
      {"id":"q2","type":"mcq","question":"Which data structure follows LIFO principle?","options":["Queue","Stack","Linked List","Tree"],"correct":"Stack","explanation":"Stack follows Last In First Out (LIFO) - the last element pushed is the first one popped.","topic":"Stacks","difficulty":"easy"},
      {"id":"q3","type":"true_false","question":"A binary search tree always guarantees O(log n) search time.","correct":"False","explanation":"An unbalanced BST can degenerate to O(n). Only balanced BSTs (like AVL) guarantee O(log n).","topic":"Trees","difficulty":"hard"},
      {"id":"q4","type":"mcq","question":"What is the average time complexity of Quick Sort?","options":["O(n)","O(n log n)","O(n²)","O(log n)"],"correct":"O(n log n)","explanation":"Quick Sort has an average time complexity of O(n log n), though worst case is O(n²).","topic":"Sorting","difficulty":"medium"}
    ]',
    4, now() - interval '12 hours'
  );

  -- ========== FLASHCARD DECKS ==========

  INSERT INTO flashcard_decks (id, user_id, note_id, title, subject, card_count, last_studied, created_at)
  VALUES (
    gen_random_uuid(), test_user_id, note3_id,
    'Psychology - Memory Types', 'Psychology', 6, now() - interval '4 hours', now() - interval '1 day'
  ) RETURNING id INTO deck1_id;

  INSERT INTO flashcard_decks (id, user_id, note_id, title, subject, card_count, created_at)
  VALUES (
    gen_random_uuid(), test_user_id, note1_id,
    'ML Key Concepts', 'Computer Science', 5, now() - interval '2 days'
  ) RETURNING id INTO deck2_id;

  -- ========== FLASHCARDS (Psychology Deck) ==========

  INSERT INTO flashcards (deck_id, user_id, front, back, next_review) VALUES
    (deck1_id, test_user_id, 'What are the three types of memory?', 'Sensory Memory, Short-Term Memory (Working Memory), and Long-Term Memory', now() - interval '1 hour'),
    (deck1_id, test_user_id, 'What is Miller''s Law?', 'Short-term memory capacity is 7 ± 2 items', now() + interval '1 day'),
    (deck1_id, test_user_id, 'What is the difference between episodic and semantic memory?', 'Episodic = personal experiences; Semantic = general knowledge/facts', now()),
    (deck1_id, test_user_id, 'What does the Ebbinghaus Forgetting Curve show?', 'We forget ~50% within an hour and ~70% within 24 hours without review', now() - interval '30 minutes'),
    (deck1_id, test_user_id, 'What is spaced repetition?', 'A study technique that reviews material at increasing intervals to combat forgetting', now() + interval '3 days'),
    (deck1_id, test_user_id, 'What is the difference between proactive and retroactive interference?', 'Proactive: old info interferes with learning new; Retroactive: new info interferes with recalling old', now());

  -- ========== FLASHCARDS (ML Deck) ==========

  INSERT INTO flashcards (deck_id, user_id, front, back, next_review) VALUES
    (deck2_id, test_user_id, 'What is supervised learning?', 'ML where the algorithm learns from labeled training data with known inputs and outputs', now()),
    (deck2_id, test_user_id, 'What is overfitting?', 'When a model learns the training data too well, including noise, and fails to generalize', now() + interval '2 days'),
    (deck2_id, test_user_id, 'Name three types of ML', 'Supervised Learning, Unsupervised Learning, Reinforcement Learning', now() - interval '2 hours'),
    (deck2_id, test_user_id, 'What is the bias-variance tradeoff?', 'Finding balance between a model that is too simple (high bias) and too complex (high variance)', now()),
    (deck2_id, test_user_id, 'What is K-Means used for?', 'Clustering — grouping similar data points together in unsupervised learning', now() + interval '1 day');

  -- ========== STUDY TASKS ==========

  INSERT INTO study_tasks (user_id, title, subject, description, study_date, duration_minutes, priority, completed, ai_generated) VALUES
    (test_user_id, 'Review ML fundamentals', 'Computer Science', 'Go through supervised vs unsupervised learning concepts', CURRENT_DATE, 45, 'high', true, false),
    (test_user_id, 'Practice sorting algorithms', 'Computer Science', 'Implement bubble sort and merge sort from scratch', CURRENT_DATE, 60, 'high', false, true),
    (test_user_id, 'Memory types flashcard review', 'Psychology', 'Review all flashcards in the Psychology Memory Types deck', CURRENT_DATE, 20, 'medium', false, true),
    (test_user_id, 'Read Chapter 5: Neural Networks', 'Computer Science', 'Deep dive into backpropagation and gradient descent', CURRENT_DATE + 1, 90, 'high', false, true),
    (test_user_id, 'Psychology quiz prep', 'Psychology', 'Generate and take a quiz on memory and learning theories', CURRENT_DATE + 1, 30, 'medium', false, false),
    (test_user_id, 'Review graph algorithms', 'Computer Science', 'Study BFS, DFS, and Dijkstra''s algorithm', CURRENT_DATE + 2, 60, 'medium', false, true),
    (test_user_id, 'Complete ML quiz retake', 'Computer Science', 'Retake the ML fundamentals quiz to improve score', CURRENT_DATE - 1, 25, 'low', true, false);

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Notes: 3, Quizzes: 2, Decks: 2, Flashcards: 11, Tasks: 7';

END $$;
