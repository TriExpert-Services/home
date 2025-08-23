# TriExpert Services - N8N API Documentation

## 🚀 Complete API for N8N Integration

Este sistema expone una API REST completa que permite a N8N gestionar todo el sistema de TriExpert Services.

## 🔑 Base URLs

```
https://[your-supabase-project].supabase.co/functions/v1/
```

### 🛠️ Authentication

Todas las APIs requieren el header de autorización con la Service Role Key:

```
Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]
```

---

## 📄 TRANSLATIONS API

### Base URL: `/api-translations`

#### **GET** `/api-translations`
Lista todas las solicitudes de traducción

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "full_name": "string",
      "email": "string",
      "phone": "string",
      "source_language": "string",
      "target_language": "string",
      "processing_time": "standard|urgent",
      "desired_format": "digital|physical|both",
      "page_count": 5,
      "document_type": "string",
      "status": "pending|in_progress|completed|cancelled",
      "total_cost": 100.00,
      "created_at": "2025-01-20T10:00:00Z",
      "file_urls": ["url1", "url2"],
      "translated_file_urls": ["url1", "url2"]
    }
  ]
}
```

#### **GET** `/api-translations/{id}`
Obtiene una solicitud específica

#### **POST** `/api-translations`
Crea una nueva solicitud de traducción

**Body:**
```json
{
  "full_name": "Juan Pérez",
  "phone": "+1234567890",
  "email": "juan@example.com",
  "source_language": "es",
  "target_language": "en",
  "processing_time": "standard",
  "desired_format": "digital",
  "page_count": 3,
  "document_type": "birth_certificate",
  "request_date": "2025-01-20",
  "special_instructions": "Para trámites de inmigración",
  "total_cost": 60.00
}
```

#### **PUT** `/api-translations/{id}`
Actualiza una solicitud completa

#### **PUT** `/api-translations/{id}/status`
Actualiza solo el estado

**Body:**
```json
{
  "status": "completed",
  "translator_notes": "Traducción completada sin observaciones",
  "delivery_date": "2025-01-21T15:30:00Z"
}
```

#### **POST** `/api-translations/{id}/files`
Añade archivos traducidos

**Body:**
```json
{
  "file_urls": ["url1", "url2"],
  "translator_notes": "Archivos completados",
  "quality_score": 5
}
```

#### **DELETE** `/api-translations/{id}`
Elimina una solicitud

---

## 📞 CONTACT LEADS API

### Base URL: `/api-leads`

#### **GET** `/api-leads`
Lista todos los leads de contacto

**Query Parameters:**
- `status`: new|contacted|qualified|converted|closed
- `priority`: low|medium|high|urgent
- `limit`: número de resultados (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "full_name": "Maria Rodriguez",
      "email": "maria@example.com",
      "company": "TechCorp",
      "phone": "+1234567890",
      "service": "consulting",
      "message": "Necesitamos consultoría...",
      "status": "new",
      "priority": "high",
      "assigned_to": "uuid",
      "admin_notes": "Lead prometedor",
      "follow_up_date": "2025-01-25T10:00:00Z",
      "estimated_value": 5000.00,
      "actual_value": 4500.00,
      "created_at": "2025-01-20T10:00:00Z"
    }
  ]
}
```

#### **POST** `/api-leads`
Crea un nuevo lead

**Body:**
```json
{
  "full_name": "Carlos Mendez",
  "email": "carlos@pyme.mx",
  "company": "PYME Solutions",
  "service": "cloud",
  "message": "Queremos migrar a la nube...",
  "estimated_value": 8000.00
}
```

#### **PUT** `/api-leads/{id}/status`
Actualiza el estado de un lead

**Body:**
```json
{
  "status": "contacted",
  "admin_notes": "Llamada realizada, interesado en propuesta"
}
```

#### **GET** `/api-leads/stats`
Obtiene estadísticas de leads

---

## ⭐ REVIEWS API

### Base URL: `/api-reviews`

#### **GET** `/api-reviews`
Lista todas las reseñas

**Query Parameters:**
- `approved`: true|false
- `featured`: true|false
- `rating`: 1|2|3|4|5
- `limit`: número de resultados

#### **PUT** `/api-reviews/{id}/approve`
Aprueba una reseña

**Body:**
```json
{
  "is_featured": true
}
```

#### **PUT** `/api-reviews/{id}/reject`
Rechaza una reseña

#### **GET** `/api-reviews/featured`
Obtiene reseñas destacadas para la homepage

#### **GET** `/api-reviews/stats`
Obtiene estadísticas de reseñas

---

## 📊 STATISTICS API

### Base URL: `/api-stats`

#### **GET** `/api-stats`
Obtiene todas las estadísticas del sistema

**Response:**
```json
{
  "success": true,
  "data": {
    "translations": {
      "total_requests": 150,
      "pending_requests": 12,
      "in_progress_requests": 8,
      "completed_requests": 130,
      "total_revenue": 15750.00
    },
    "leads": {
      "total_leads": 45,
      "new_leads": 8,
      "contacted_leads": 15,
      "converted_leads": 12,
      "conversion_rate": 26.67
    },
    "reviews": {
      "total_reviews": 28,
      "average_rating": 4.8,
      "rating_5_count": 24
    },
    "summary": {
      "total_revenue": 23450.00,
      "active_projects": 20,
      "client_satisfaction": 4.8,
      "conversion_rate": 26.67
    }
  }
}
```

#### **GET** `/api-stats/translations`
Solo estadísticas de traducciones

#### **GET** `/api-stats/leads`
Solo estadísticas de leads

#### **GET** `/api-stats/reviews`
Solo estadísticas de reseñas

---

## 🔔 NOTIFICATIONS API

### Base URL: `/api-notifications`

#### **POST** `/api-notifications/email`
Envía notificación por email

**Body:**
```json
{
  "to": "client@example.com",
  "subject": "Translation Completed",
  "html": "<h1>Your translation is ready!</h1>",
  "text": "Your translation is ready!",
  "from": "TriExpert Services <noreply@triexpertservice.com>"
}
```

#### **POST** `/api-notifications/sms`
Envía notificación por SMS

**Body:**
```json
{
  "to": "+1234567890",
  "message": "Your translation is ready for download"
}
```

#### **POST** `/api-notifications/webhook`
Webhook genérico para integraciones

---

## 🛠️ N8N Integration Examples

### 1. **Automatic Lead Processing Workflow**

```yaml
Trigger: HTTP Request (webhook from contact form)
↓
Node: Create Lead (POST /api-leads)
↓
Node: Send Email Notification (/api-notifications/email)
↓
Node: Set Follow-up Reminder
```

### 2. **Translation Status Updates**

```yaml
Trigger: Manual/Schedule
↓
Node: Get Pending Translations (GET /api-translations?status=pending)
↓
Node: Update Status (PUT /api-translations/{id}/status)
↓
Node: Send Client Notification
```

### 3. **Review Moderation Workflow**

```yaml
Trigger: Schedule (daily)
↓
Node: Get Pending Reviews (GET /api-reviews?approved=false)
↓
Node: Auto-approve 5-star reviews (PUT /api-reviews/{id}/approve)
↓
Node: Notify admin of reviews needing manual review
```

### 4. **Daily Statistics Report**

```yaml
Trigger: Schedule (daily 9 AM)
↓
Node: Get All Stats (GET /api-stats)
↓
Node: Format Report
↓
Node: Send Email Report to Management
```

---

## 🔐 Security & Best Practices

### Headers Requeridos
```
Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]
Content-Type: application/json
```

### Error Responses
```json
{
  "success": false,
  "error": "Error message"
}
```

### Rate Limits
- Las Edge Functions tienen límites de Supabase
- Usa timeouts apropiados en N8N (30s recomendado)

---

## 🚀 Getting Started with N8N

1. **Add HTTP Request Nodes** en tus workflows
2. **Configure Base URL**: `https://[proyecto].supabase.co/functions/v1/`
3. **Add Authorization Header** con tu Service Role Key
4. **Set Content-Type**: `application/json`
5. **Test** cada endpoint individualmente

### Ejemplo de Node N8N:
```json
{
  "method": "GET",
  "url": "https://your-project.supabase.co/functions/v1/api-stats",
  "headers": {
    "Authorization": "Bearer your-service-role-key",
    "Content-Type": "application/json"
  }
}
```

---

¡Ahora tienes control completo del sistema TriExpert Services desde N8N! 🎉

Puedes automatizar:
- ✅ Procesamiento de leads
- ✅ Actualizaciones de estado
- ✅ Notificaciones automáticas
- ✅ Reportes diarios
- ✅ Moderación de reseñas
- ✅ Gestión de traducciones

**¡Todo desde N8N con esta API completa!** 🚀