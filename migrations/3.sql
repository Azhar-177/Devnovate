
-- Insert more sample articles starting from a safe ID
INSERT INTO articles (
  title, 
  slug, 
  content, 
  excerpt, 
  cover_image_url, 
  author_id, 
  status, 
  published_at, 
  views_count, 
  likes_count, 
  comments_count, 
  created_at, 
  updated_at
) VALUES 
(
  'CSS Grid vs Flexbox: When to Use Each',
  'css-grid-vs-flexbox-when-to-use-' || strftime('%s', 'now'),
  '# CSS Grid vs Flexbox: When to Use Each

Both CSS Grid and Flexbox are powerful layout tools, but they serve different purposes. Understanding when to use each one will make you a more effective developer.

## CSS Flexbox: One-Dimensional Layouts

Flexbox is designed for **one-dimensional layouts** - either a row or a column.

### When to Use Flexbox

- Navigation bars
- Button groups
- Centering content
- Distributing space between items
- Card layouts in a single row/column

### Flexbox Example

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}
```

## CSS Grid: Two-Dimensional Layouts

CSS Grid excels at **two-dimensional layouts** - both rows and columns simultaneously.

### When to Use Grid

- Page layouts
- Complex card layouts
- Image galleries
- Dashboard layouts
- Any design requiring precise placement

### Grid Example

```css
.page-layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

## Combining Both

Often, you''ll use both in the same project for maximum effectiveness.',
  'Understand the differences between CSS Grid and Flexbox, when to use each layout method, and how they can work together.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
  'demo-user-css',
  'published',
  datetime('now', '-2 days'),
  756,
  43,
  12,
  datetime('now', '-2 days'),
  datetime('now', '-2 days')
),
(
  'Python for Beginners: Your First Steps',
  'python-beginners-first-steps-' || strftime('%s', 'now'),
  '# Python for Beginners: Your First Steps

Python is one of the most beginner-friendly programming languages. Let''s explore the fundamental concepts every Python developer should know.

## Why Python?

- **Easy to learn**: Simple, readable syntax
- **Versatile**: Web development, data science, automation, AI
- **Large community**: Extensive libraries and support
- **High demand**: Popular in tech industry

## Your First Python Program

```python
print("Hello, World!")
```

## Variables and Data Types

```python
# Variables
name = "Alice"
age = 25
height = 5.6
is_student = True

# Data types
text = "Hello"           # String
number = 42             # Integer
decimal = 3.14          # Float
active = True           # Boolean
```

## Working with Lists

```python
fruits = ["apple", "banana", "orange"]
fruits.append("grape")
print(fruits[0])  # First item
```

## Functions

```python
def greet(name):
    return f"Hello, {name}!"

message = greet("Bob")
print(message)
```

Start your Python journey today!',
  'Master the fundamentals of Python programming. Perfect for beginners starting their coding journey.',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop',
  'demo-user-python',
  'published',
  datetime('now', '-1 day'),
  623,
  52,
  15,
  datetime('now', '-1 day'),
  datetime('now', '-1 day')
),
(
  'JavaScript ES6+ Features You Should Know',
  'javascript-es6-features-you-should-know-' || strftime('%s', 'now'),
  '# JavaScript ES6+ Features You Should Know

Modern JavaScript has evolved significantly. Here are the essential ES6+ features every developer should master.

## Arrow Functions

```javascript
// Old way
function add(a, b) {
  return a + b;
}

// ES6 way
const add = (a, b) => a + b;
```

## Template Literals

```javascript
const name = "John";
const age = 30;

// ES6 template literals
const message = `Hello, my name is ${name} and I am ${age} years old.`;
```

## Destructuring

```javascript
// Array destructuring
const [first, second] = [1, 2, 3];

// Object destructuring
const { name, email } = user;
```

## Async/Await

```javascript
async function fetchData() {
  try {
    const response = await fetch(''/api/data'');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

## Modules

```javascript
// Export
export const myFunction = () => {};
export default MyComponent;

// Import
import MyComponent, { myFunction } from ''./module'';
```

These features make JavaScript more powerful and enjoyable to work with!',
  'Discover the most important ES6+ JavaScript features including arrow functions, destructuring, async/await, and more.',
  'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=400&fit=crop',
  'demo-user-js',
  'published',
  datetime('now', '-3 hours'),
  445,
  38,
  9,
  datetime('now', '-3 hours'),
  datetime('now', '-3 hours')
);

-- Add tags for the new articles
INSERT OR IGNORE INTO article_tags (article_id, tag_name, created_at, updated_at) VALUES
-- CSS article (assuming it gets ID 6)
((SELECT MAX(id) FROM articles WHERE title LIKE '%CSS Grid%'), 'css', datetime('now', '-2 days'), datetime('now', '-2 days')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%CSS Grid%'), 'grid', datetime('now', '-2 days'), datetime('now', '-2 days')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%CSS Grid%'), 'flexbox', datetime('now', '-2 days'), datetime('now', '-2 days')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%CSS Grid%'), 'layout', datetime('now', '-2 days'), datetime('now', '-2 days')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%CSS Grid%'), 'frontend', datetime('now', '-2 days'), datetime('now', '-2 days')),

-- Python article
((SELECT MAX(id) FROM articles WHERE title LIKE '%Python for Beginners%'), 'python', datetime('now', '-1 day'), datetime('now', '-1 day')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%Python for Beginners%'), 'beginners', datetime('now', '-1 day'), datetime('now', '-1 day')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%Python for Beginners%'), 'programming', datetime('now', '-1 day'), datetime('now', '-1 day')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%Python for Beginners%'), 'tutorial', datetime('now', '-1 day'), datetime('now', '-1 day')),

-- JavaScript article
((SELECT MAX(id) FROM articles WHERE title LIKE '%JavaScript ES6%'), 'javascript', datetime('now', '-3 hours'), datetime('now', '-3 hours')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%JavaScript ES6%'), 'es6', datetime('now', '-3 hours'), datetime('now', '-3 hours')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%JavaScript ES6%'), 'modern-js', datetime('now', '-3 hours'), datetime('now', '-3 hours')),
((SELECT MAX(id) FROM articles WHERE title LIKE '%JavaScript ES6%'), 'frontend', datetime('now', '-3 hours'), datetime('now', '-3 hours'));

-- Create sample user profiles for the demo articles
INSERT OR IGNORE INTO user_profiles (mocha_user_id, username, bio, avatar_url, is_admin, created_at, updated_at) VALUES
('demo-user-css', 'CSSGuru', 'UI/UX developer with expertise in modern CSS layouts. Always excited about new layout techniques and responsive design.', 'https://ui-avatars.com/api/?name=CSSGuru&background=f59e0b&color=fff', 0, datetime('now', '-6 days'), datetime('now', '-6 days')),
('demo-user-python', 'PythonPro', 'Data scientist and Python educator. Helping beginners learn programming fundamentals and advanced data analysis.', 'https://ui-avatars.com/api/?name=PythonPro&background=8b5cf6&color=fff', 0, datetime('now', '-4 days'), datetime('now', '-4 days')),
('demo-user-js', 'JSNinja', 'Full-stack JavaScript developer passionate about modern web technologies and teaching best practices.', 'https://ui-avatars.com/api/?name=JSNinja&background=06b6d4&color=fff', 0, datetime('now', '-2 days'), datetime('now', '-2 days'));
